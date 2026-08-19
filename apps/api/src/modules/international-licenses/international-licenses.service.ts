import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { addYears, format } from 'date-fns';
import {
  ApplicationStatus,
  ApplicationType,
  InternationalEligibleDriverDto,
  InternationalLicenseDto,
  LicenseClassDto,
} from '@repo/shared';
import { LocalLicenseApplicationsService } from '../local-license-applications/local-license-applications.service';
import { LookupService } from '../lookup/lookup.service';
import { LicensesService } from '../licenses/licenses.service';
import { InternationalLicense } from './entities/international-license.entity';
import {
  InternationalLicensesRepository,
  PaginatedInternationalLicenses,
} from './repositories/international-licenses.repository';

// InternationalLicensesService — issuance (Feature 8.1): one international
// document per driver, based on their active, unexpired Car license
// (invariant #24 + expiry gate), valid exactly one year (§ library-docs 8).
const CAR_CLASS_TITLE = 'Ordinary Driving License (Car)';

@Injectable()
export class InternationalLicensesService {
  constructor(
    private readonly internationalLicensesRepo: InternationalLicensesRepository,
    private readonly licensesService: LicensesService,
    private readonly appsService: LocalLicenseApplicationsService,
    private readonly lookupService: LookupService,
    private readonly dataSource: DataSource,
  ) {}

  // Projects a joined row into the shared flat DTO.
  private toDto(row: InternationalLicense): InternationalLicenseDto {
    return {
      id: row.id,
      applicationId: row.applicationId,
      driverId: row.driverId,
      driverName: `${row.driver.person.firstName} ${row.driver.person.lastName}`,
      nationalNumber: row.driver.person.nationalNumber,
      issuedUsingLocalLicenseId: row.issuedUsingLocalLicenseId,
      issueDate: row.issueDate,
      expirationDate: row.expirationDate,
      isActive: row.isActive,
    };
  }

  // Paginated international license register, newest first — the 8.2 table
  // source; the Active/Expired status renders from ExpirationDate.
  async findAll(
    page: number,
    pageSize: number,
  ): Promise<{
    data: InternationalLicenseDto[];
    meta: PaginatedInternationalLicenses['meta'];
  }> {
    const { data, meta } =
      await this.internationalLicensesRepo.findAll(page, pageSize);
    return { data: data.map((row) => this.toDto(row)), meta };
  }

  // Drivers holding an active, unexpired Car license — the 8.2 picker's
  // feed; the eligibility query stays in the licenses domain.
  async findEligible(
    page: number,
    pageSize: number,
  ): Promise<{
    data: InternationalEligibleDriverDto[];
    meta: PaginatedInternationalLicenses['meta'];
  }> {
    const licenseClass = await this.resolveCarClass();
    const { data, meta } = await this.licensesService.findActiveCarLicenses(
      licenseClass.id,
      page,
      pageSize,
    );
    return {
      data: data.map((license) => ({
        driverId: license.driverId,
        driverName: `${license.driver.person.firstName} ${license.driver.person.lastName}`,
        nationalNumber: license.driver.person.nationalNumber,
        localLicenseId: license.id,
      })),
      meta,
    };
  }

  // Issues an international license: the eligibility and duplicate guards run
  // inside ONE transaction with the application + license inserts, so a guard
  // failure never leaves a half-completed write (invariants #24, #28, #29).
  async issueInternationalLicense(
    driverId: number,
    actingUserId: number,
  ): Promise<InternationalLicenseDto> {
    const licenseClass = await this.resolveCarClass();

    // The fee source: the seeded New International application type (never
    // from the client, snapshot at write time — invariant #28).
    const applicationType =
      await this.lookupService.findApplicationTypeByTitle(
        ApplicationType.NEW_INTERNATIONAL_LICENSE,
      );
    if (!applicationType) {
      throw new NotFoundException(
        'New International License application type is not configured',
      );
    }

    const issueDate = new Date();
    const saved = await this.dataSource.transaction(async (manager) => {
      // The active, unexpired Car license is the document's basis; a driver
      // without one (or without a Drivers row at all) is ineligible — 400.
      const localLicense =
        await this.licensesService.findActiveUnexpiredLicenseOnManager(
          manager,
          driverId,
          licenseClass.id,
        );
      if (!localLicense) {
        throw new BadRequestException(
          'Driver does not hold an active Ordinary Driving License (Car) license',
        );
      }

      // One valid international document per driver at a time — a new one
      // becomes possible again once the current document expires.
      const existing = await manager.findOne(InternationalLicense, {
        where: {
          driverId,
          expirationDate: MoreThanOrEqual(format(issueDate, 'yyyy-MM-dd')),
        },
      });
      if (existing) {
        throw new ConflictException(
          `Driver already holds a valid international license (expires ${existing.expirationDate})`,
        );
      }

      // The application row rides this transaction; it resolves as Completed
      // the moment the license exists (7.1 renewal precedent).
      const application = await this.appsService.createInTransaction(manager, {
        applicantPersonId: localLicense.driver.person.id,
        applicationTypeId: applicationType.id,
        applicationStatus: ApplicationStatus.COMPLETED,
        paidFees: applicationType.applicationFees,
        createdByUserId: actingUserId,
      });

      // Fixed 1-year validity, independent of the underlying license's class.
      return manager.save(
        manager.create(InternationalLicense, {
          applicationId: application.id,
          driverId,
          issuedUsingLocalLicenseId: localLicense.id,
          issueDate: format(issueDate, 'yyyy-MM-dd'),
          expirationDate: format(addYears(issueDate, 1), 'yyyy-MM-dd'),
          isActive: true,
          createdByUserId: actingUserId,
        }),
      );
    });

    // Reload with the join set — the insert can't populate the relations.
    return this.toDto((await this.internationalLicensesRepo.findById(saved.id))!);
  }

  // Resolves the Car class by its invariant #24 wording; a vanished class
  // row is a configuration failure, not a silent no-op.
  private async resolveCarClass(): Promise<LicenseClassDto> {
    const licenseClass =
      await this.lookupService.findLicenseClassByTitle(CAR_CLASS_TITLE);
    if (!licenseClass) {
      throw new NotFoundException(
        `${CAR_CLASS_TITLE} license class is not configured`,
      );
    }
    return licenseClass;
  }
}