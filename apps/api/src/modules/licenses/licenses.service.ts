import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, MoreThanOrEqual } from 'typeorm';
import { addYears, format } from 'date-fns';
import {
  ApplicationStatus,
  ApplicationType,
  IssueReason,
  LicenseDto,
  LicenseRegisterRowDto,
} from '@repo/shared';
import { LocalLicenseApplicationsService } from '../local-license-applications/local-license-applications.service';
import { LookupService } from '../lookup/lookup.service';
import { TestingService } from '../testing/testing.service';
import { DriversService } from '../drivers/drivers.service';
import { DetainReleaseService } from '../detain-release/detain-release.service';
import { License } from './entities/license.entity';
import {
  LicensesRepository,
  PaginatedActiveCarLicenses,
  RegisterLicenseRow,
} from './repositories/licenses.repository';
import { IssueLicenseRequestDto } from './dtos/issue-license-request.dto';

// LicensesService — license issuance (Feature 6.1), renewal & replacement
// (Feature 7.1): issuance re-verifies the test pipeline server-side and
// completes the application; renewal/replacement mints a reason-matched
// application and deactivates the old license — each in ONE transaction.
@Injectable()
export class LicensesService {
  constructor(
    private readonly licensesRepo: LicensesRepository,
    private readonly appsService: LocalLicenseApplicationsService,
    private readonly lookupService: LookupService,
    private readonly testingService: TestingService,
    private readonly driversService: DriversService,
    @Inject(forwardRef(() => DetainReleaseService))
    private readonly detainReleaseService: DetainReleaseService,
    private readonly dataSource: DataSource,
  ) {}

  // Projects a joined license into the shared flat DTO.
  private toDto(license: License): LicenseDto {
    return {
      id: license.id,
      applicationId: license.applicationId,
      driverId: license.driverId,
      driverName: `${license.driver.person.firstName} ${license.driver.person.lastName}`,
      nationalNumber: license.driver.person.nationalNumber,
      licenseClassId: license.licenseClassId,
      className: license.licenseClass.className,
      issueDate: license.issueDate,
      expirationDate: license.expirationDate,
      notes: license.notes,
      paidFees: license.paidFees,
      isActive: license.isActive,
      issueReason: license.issueReason,
    };
  }

  // Register projection adds the computed isDetained flag — the 7.2 screen's
  // Status column and disabled actions read it (Feature 10's history reuses it).
  private toRegisterRowDto(license: RegisterLicenseRow): LicenseRegisterRowDto {
    return {
      id: license.id,
      driverId: license.driverId,
      driverName: `${license.driver.person.firstName} ${license.driver.person.lastName}`,
      nationalNumber: license.driver.person.nationalNumber,
      licenseClassId: license.licenseClassId,
      className: license.licenseClass.className,
      issueDate: license.issueDate,
      expirationDate: license.expirationDate,
      notes: license.notes,
      paidFees: license.paidFees,
      isActive: license.isActive,
      isDetained: license.isDetained,
      issueReason: license.issueReason,
    };
  }

  // Maps the request reason to the IssueReason int and the ApplicationType
  // whose fee pays for this renewal/replacement.
  private reasonMapping(reason: 'renew' | 'damaged' | 'lost'): {
    issueReason: IssueReason;
    applicationTypeTitle: ApplicationType;
  } {
    switch (reason) {
      case 'renew':
        return {
          issueReason: IssueReason.RENEW,
          applicationTypeTitle: ApplicationType.RENEW_DRIVING_LICENSE,
        };
      case 'damaged':
        return {
          issueReason: IssueReason.REPLACEMENT_DAMAGED,
          applicationTypeTitle: ApplicationType.REPLACEMENT_FOR_DAMAGED_LICENSE,
        };
      case 'lost':
        return {
          issueReason: IssueReason.REPLACEMENT_LOST,
          applicationTypeTitle: ApplicationType.REPLACEMENT_FOR_LOST_LICENSE,
        };
    }
  }

  // Issues the license: driver find-or-create, license insert, and application
  // completion must succeed or fail together, so they run in one transaction.
  async issueLicense(
    llaId: number,
    dto: IssueLicenseRequestDto,
    actingUserId: number,
  ): Promise<LicenseDto> {
    // The application must exist (and its 404 semantics come from the apps service).
    const application = await this.appsService.findOne(llaId);

    // Only a New application can be issued.
    if (application.applicationStatus !== ApplicationStatus.NEW) {
      throw new ConflictException(
        `Cannot issue a license for a ${application.applicationStatus} application`,
      );
    }

    // Re-verify the full pipeline server-side — never trust the UI's button state.
    const pipeline = await this.testingService.getPipeline(llaId);
    if (!pipeline.stages.every((stage) => stage.status === 'Passed')) {
      throw new ConflictException(
        'All test stages must be passed before issuing a license',
      );
    }

    // The class row supplies the fee snapshot and the validity length.
    const licenseClass = await this.lookupService.findLicenseClassById(
      application.licenseClassId,
    );
    if (!licenseClass) {
      throw new NotFoundException('License class not found');
    }

    const issueDate = new Date();
    const saved = await this.dataSource.transaction(async (manager) => {
      // Find-or-create the driver inside the same transaction.
      const driver = await this.driversService.findOrCreateByPersonId(
        manager,
        application.personId,
        actingUserId,
      );

      // A driver may never hold two active licenses of the same class.
      const existingActive = await manager.findOne(License, {
        where: { driverId: driver.id, licenseClassId: licenseClass.id, isActive: true },
      });
      if (existingActive) {
        throw new ConflictException(
          `Driver already holds an active ${licenseClass.className} license`,
        );
      }

      // Fee snapshotted from LicenseClasses.ClassFees at issue time;
      // validity = IssueDate + DefaultValidityLength years.
      const license = await manager.save(
        manager.create(License, {
          applicationId: application.applicationId,
          driverId: driver.id,
          licenseClassId: licenseClass.id,
          issueDate: format(issueDate, 'yyyy-MM-dd'),
          expirationDate: format(
            addYears(issueDate, licenseClass.defaultValidityLength),
            'yyyy-MM-dd',
          ),
          notes: dto.notes ?? null,
          paidFees: licenseClass.classFees,
          isActive: true,
          issueReason: IssueReason.FIRST_TIME,
          createdByUserId: actingUserId,
        }),
      );

      // Complete the application in the same transaction.
      await this.appsService.completeInTransaction(
        manager,
        application.applicationId,
        new Date(),
      );

      return license;
    });

    // Reload with the join set — the insert can't populate the relations.
    return this.toDto((await this.licensesRepo.findById(saved.id))!);
  }

  // Paginated license register (every local license, newest first) with the
  // server-computed isDetained flag — powers the 7.2 renew/replace screen.
  async findRegister(
    page: number,
    pageSize: number,
  ): Promise<{ data: LicenseRegisterRowDto[]; meta: { total: number; page: number; pageSize: number } }> {
    const { data, meta } = await this.licensesRepo.findAllForRegister(page, pageSize);
    return { data: data.map((license) => this.toRegisterRowDto(license)), meta };
  }

  // Renews or replaces a license: creates the reason-matched application,
  // deactivates the old row, and inserts the new one — all in ONE transaction
  // (invariants #26, #32, #28, #29).
  async renewOrReplace(
    existingLicenseId: number,
    reason: 'renew' | 'damaged' | 'lost',
    notes: string | undefined,
    actingUserId: number,
  ): Promise<LicenseDto> {
    // The license under renewal must exist (404) and still be active (409).
    const license = await this.licensesRepo.findById(existingLicenseId);
    if (!license) {
      throw new NotFoundException('License not found');
    }
    if (!license.isActive) {
      throw new ConflictException(
        'Only an active license can be renewed or replaced',
      );
    }

    // The reason picks the application type, whose fee is snapshotted below.
    const { issueReason, applicationTypeTitle } = this.reasonMapping(reason);
    const applicationType = await this.lookupService.findApplicationTypeByTitle(
      applicationTypeTitle,
    );
    if (!applicationType) {
      throw new NotFoundException(
        `${applicationTypeTitle} application type is not configured`,
      );
    }

    const issueDate = new Date();
    const saved = await this.dataSource.transaction(async (manager) => {
      // A license under an open detention can't be touched here (invariant #32).
      if (await this.detainReleaseService.hasOpenDetention(manager, existingLicenseId)) {
        throw new ConflictException(
          'License is currently detained and cannot be renewed or replaced',
        );
      }

      // The application row rides this transaction; it resolves as Completed
      // the moment the new license exists (never observable, never cancellable).
      const application = await this.appsService.createInTransaction(manager, {
        applicantPersonId: license.driver.person.id,
        applicationTypeId: applicationType.id,
        applicationStatus: ApplicationStatus.COMPLETED,
        paidFees: applicationType.applicationFees,
        createdByUserId: actingUserId,
      });

      // The WHERE IsActive guard makes a concurrent renewal hit 0 rows here
      // instead of minting a second active same-class license (invariant #26).
      const deactivated = await manager.update(
        License,
        { id: existingLicenseId, isActive: true },
        { isActive: false },
      );
      if (deactivated.affected !== 1) {
        throw new ConflictException('License is no longer active');
      }

      // The new row reuses the old license's driver and class, with fresh
      // dates and a fee snapshot from the class configuration (invariant #28).
      return manager.save(
        manager.create(License, {
          applicationId: application.id,
          driverId: license.driverId,
          licenseClassId: license.licenseClassId,
          issueDate: format(issueDate, 'yyyy-MM-dd'),
          expirationDate: format(
            addYears(issueDate, license.licenseClass.defaultValidityLength),
            'yyyy-MM-dd',
          ),
          notes: notes ?? null,
          paidFees: license.licenseClass.classFees,
          isActive: true,
          issueReason,
          createdByUserId: actingUserId,
        }),
      );
    });

    // Reload with the join set — the insert can't populate the relations.
    return this.toDto((await this.licensesRepo.findById(saved.id))!);
  }

  // Active, unexpired licenses of one class, newest first — the
  // international feature's eligible-driver source (resolution of the Car
  // class by title lives in the international module).
  async findActiveCarLicenses(
    licenseClassId: number,
    page: number,
    pageSize: number,
  ): Promise<PaginatedActiveCarLicenses> {
    return this.licensesRepo.findActiveCarLicenses(
      licenseClassId,
      page,
      pageSize,
      format(new Date(), 'yyyy-MM-dd'),
    );
  }

  // Active licenses with no open detention, newest first — the detention
  // feature's "Select active license" feed (the DTO mapping lives in the
  // detain-release module, international precedent).
  async findEligibleForDetention(
    page: number,
    pageSize: number,
  ): Promise<PaginatedActiveCarLicenses> {
    return this.licensesRepo.findActiveLicensesWithoutOpenDetention(
      page,
      pageSize,
    );
  }

  // Single license read used by the detention domain's write guard; runs on
  // the caller's transaction manager so the detain check sees the
  // transaction's own uncommitted state.
  async findLicenseOnManager(
    manager: EntityManager,
    licenseId: number,
  ): Promise<License | null> {
    return manager.findOne(License, {
      where: { id: licenseId },
    });
  }

  // Runs on the caller's transaction manager so an issuance gate sees the
  // transaction's own uncommitted state — the #24 twin of the #26 guard.
  async findActiveUnexpiredLicenseOnManager(
    manager: EntityManager,
    driverId: number,
    licenseClassId: number,
  ): Promise<License | null> {
    return manager.findOne(License, {
      relations: { driver: { person: true } },
      where: {
        driverId,
        licenseClassId,
        isActive: true,
        expirationDate: MoreThanOrEqual(format(new Date(), 'yyyy-MM-dd')),
      },
    });
  }
}