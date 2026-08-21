import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  ApplicationStatus,
  ApplicationType,
  LocalDrivingLicenseApplicationDto,
} from '@repo/shared';
import { differenceInYears, parseISO } from 'date-fns';
import { PeopleService } from '../people/people.service';
import { LookupService } from '../lookup/lookup.service';
import { Driver } from '../drivers/entities/driver.entity';
import { License } from '../licenses/entities/license.entity';
import { Application } from './entities/application.entity';
import { LocalDrivingLicenseApplication } from './entities/local-driving-license-application.entity';
import { TestAppointment } from '../testing/entities/test-appointment.entity';
import {
  FindAllLocalLicenseApplicationsParams,
  LocalLicenseApplicationsRepository,
  PaginatedLocalLicenseApplications,
} from './repositories/local-license-applications.repository';
import { CreateLocalLicenseApplicationRequestDto } from './dtos/create-local-license-application-request.dto';

// LocalLicenseApplicationsService — application business rules: one license
// class per application, minimum age enforcement, fee snapshot at create time,
// and a strict New → Cancelled | Completed status lifecycle.
@Injectable()
export class LocalLicenseApplicationsService {
  constructor(
    private readonly appsRepo: LocalLicenseApplicationsRepository,
    private readonly peopleService: PeopleService,
    private readonly lookupService: LookupService,
    private readonly dataSource: DataSource,
  ) {}

  // Projects a joined entity into the shared flat DTO.
  private toDto(
    lla: LocalDrivingLicenseApplication,
    passedTests = 0,
  ): LocalDrivingLicenseApplicationDto {
    const { application, licenseClass } = lla;
    return {
      id: lla.id,
      applicationId: application.id,
      personId: application.person.id,
      applicantName: `${application.person.firstName} ${application.person.lastName}`,
      nationalNumber: application.person.nationalNumber,
      dateOfBirth: application.person.dateOfBirth,
      gender: application.person.gender,
      licenseClassId: licenseClass.id,
      className: licenseClass.className,
      applicationStatus: application.applicationStatus,
      paidFees: application.paidFees,
      applicationDate: application.applicationDate.toISOString(),
      lastStatusDate: application.lastStatusDate.toISOString(),
      passedTests,
    };
  }

  // Paginated, filterable register for the applications list screen.
  async findAll(
    params: FindAllLocalLicenseApplicationsParams,
  ): Promise<{ data: LocalDrivingLicenseApplicationDto[]; meta: PaginatedLocalLicenseApplications['meta'] }> {
    const { data, meta } = await this.appsRepo.findAll(params);
    if (data.length === 0) {
      return { data: [], meta };
    }
    const llaIds = data.map((lla) => lla.id);
    const passedRows: Array<{ llaId: string; passed: string }> = await this.dataSource
      .getRepository(TestAppointment)
      .createQueryBuilder('ta')
      .innerJoin('ta.test', 't')
      .select('ta.llaId', 'llaId')
      .addSelect('COUNT(DISTINCT ta.testTypeId)', 'passed')
      .where('ta.llaId IN (:...llaIds)', { llaIds })
      .andWhere('t.testResult = :result', { result: true })
      .groupBy('ta.llaId')
      .getRawMany();
    const passedById = new Map<number, number>(
      passedRows.map((r) => [Number(r.llaId), Number(r.passed)]),
    );
    return {
      data: data.map((lla) => this.toDto(lla, passedById.get(lla.id) ?? 0)),
      meta,
    };
  }

  // Single application lookup (detail screen); 404 when missing.
  async findOne(id: number): Promise<LocalDrivingLicenseApplicationDto> {
    const lla = await this.appsRepo.findById(id);
    if (!lla) {
      throw new NotFoundException('Local driving license application not found');
    }
    return this.toDto(lla);
  }

  // Files a new application: verifies the applicant and the class, snapshots
  // the NewDrivingLicense fee, and writes both rows (Applications + child) atomically.
  async create( 
    dto: CreateLocalLicenseApplicationRequestDto,
    actingUserId: number,
  ): Promise<LocalDrivingLicenseApplicationDto> {
    // The applicant must exist.
    const person = await this.peopleService.findOne(dto.personId);

    // The license class must exist (its MinimumAllowedAge drives the age gate).
    const licenseClass = await this.lookupService.findLicenseClassById(
      dto.licenseClassId,
    );
    if (!licenseClass) {
      throw new NotFoundException('License class not found');
    }

    // Age gate: the applicant must have reached the class's minimum age.
    const age = differenceInYears(new Date(), parseISO(person.dateOfBirth));
    if (age < licenseClass.minimumAllowedAge) {
      throw new BadRequestException(
        `Applicant must be at least ${licenseClass.minimumAllowedAge} to apply for ${licenseClass.className}`,
      );
    }

    // Fail-fast duplicate guard: if the person is already a driver holding
    // an active license of this class, reject now instead of after the full
    // test pipeline. The authoritative inside-transaction guard stays in
    // LicensesService.issueLicense (invariant #26 / race backstop).
    const driver = await this.dataSource
      .getRepository(Driver)
      .findOne({ where: { personId: dto.personId } });
    if (driver) {
      const existingActive = await this.dataSource
        .getRepository(License)
        .findOne({
          where: {
            driverId: driver.id,
            licenseClassId: dto.licenseClassId,
            isActive: true,
          },
        });
      if (existingActive) {
        throw new ConflictException(
          `Driver already holds an active ${licenseClass.className} license`,
        );
      }
    }

    // Fee source = the seeded NewDrivingLicense application type (never from the client).
    const applicationType = await this.lookupService.findApplicationTypeByTitle(
      ApplicationType.NEW_DRIVING_LICENSE,
    );
    if (!applicationType) {
      throw new NotFoundException(
        'New Driving License application type is not configured',
      );
    }

    // Parent + child rows written in one transaction.
    const lla = await this.dataSource.transaction(async (manager) => {
      const now = new Date();
      const application = manager.create(Application, {
        applicantPersonId: dto.personId,
        applicationDate: now,
        applicationTypeId: applicationType.id,
        applicationStatus: ApplicationStatus.NEW,
        lastStatusDate: now,
        paidFees: applicationType.applicationFees,
        createdByUserId: actingUserId,
      });
      const savedApplication = await manager.save(application);

      // Chain the child row to the freshly generated parent id.
      const localApp = manager.create(LocalDrivingLicenseApplication, {
        applicationId: savedApplication.id,
        licenseClassId: dto.licenseClassId,
      });
      return manager.save(localApp);
    });

    // Reload with the join set — the insert can't populate the relations.
    return this.toDto(await this.appsRepo.findById(lla.id).then((row) => row!));
  }

  // Cancels a New application (status → Cancelled); a one-way door, so
  // Cancelled and Completed applications reject it with a 409.
  async cancel(id: number): Promise<LocalDrivingLicenseApplicationDto> {
    // 404 when missing; the current status drives the guard below.
    const lla = await this.appsRepo.findById(id);
    if (!lla) {
      throw new NotFoundException('Local driving license application not found');
    }

    // Only New applications may be cancelled.
    if (lla.application.applicationStatus !== ApplicationStatus.NEW) {
      throw new ConflictException(
        `Only a new application can be cancelled (current status: ${lla.application.applicationStatus})`,
      );
    }

    // Persist the transition, stamping LastStatusDate for the audit trail.
    await this.appsRepo.updateApplicationStatus(
      lla.applicationId,
      ApplicationStatus.CANCELLED,
      new Date(),
    );

    const updated = await this.appsRepo.findById(id);
    return this.toDto(updated!);
  }

  // Marks an application Completed inside the caller's transaction — the
  // final step of license issuance, atomic with the license insert.
  async completeInTransaction(
    manager: EntityManager,
    applicationId: number,
    completedAt: Date,
  ): Promise<void> {
    await manager.update(
      Application,
      { id: applicationId },
      { applicationStatus: ApplicationStatus.COMPLETED, lastStatusDate: completedAt },
    );
  }

  // Creates an Applications row inside the caller's transaction — used by
  // renewal/replacement (Feature 7.1), whose license insert and application
  // creation must succeed or fail together.
  async createInTransaction(
    manager: EntityManager,
    params: {
      applicantPersonId: number;
      applicationTypeId: number;
      applicationStatus: ApplicationStatus;
      paidFees: string;
      createdByUserId: number;
    },
  ): Promise<Application> {
    const now = new Date();
    return manager.save(
      manager.create(Application, {
        applicantPersonId: params.applicantPersonId,
        applicationDate: now,
        applicationTypeId: params.applicationTypeId,
        applicationStatus: params.applicationStatus,
        lastStatusDate: now,
        paidFees: params.paidFees,
        createdByUserId: params.createdByUserId,
      }),
    );
  }
}