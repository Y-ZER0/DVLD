import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { addYears, format } from 'date-fns';
import { ApplicationStatus, IssueReason, LicenseDto } from '@repo/shared';
import { LocalLicenseApplicationsService } from '../local-license-applications/local-license-applications.service';
import { LookupService } from '../lookup/lookup.service';
import { TestingService } from '../testing/testing.service';
import { DriversService } from '../drivers/drivers.service';
import { License } from './entities/license.entity';
import { LicensesRepository } from './repositories/licenses.repository';
import { IssueLicenseRequestDto } from './dtos/issue-license-request.dto';

// LicensesService — the issuance heart of Feature 6.1 (build-plan.md
// § 6.1, architecture.md module list: licenses/ owns "issuance, renewal,
// replacement"). issueLicense() is the one-way door that ends an
// application's lifecycle: it re-verifies the full test pipeline
// server-side (invariant #22 — never trust the UI's button state),
// finds-or-creates the driver (invariant #23), snapshots the class fee
// (invariant #28), refuses a second active license for the same class
// (invariant #26), and marks the application Completed — all in ONE
// transaction. Entities never leave this module (invariant #11): every
// return path projects through toDto().
@Injectable()
export class LicensesService {
  constructor(
    private readonly licensesRepo: LicensesRepository,
    private readonly appsService: LocalLicenseApplicationsService,
    private readonly lookupService: LookupService,
    private readonly testingService: TestingService,
    private readonly driversService: DriversService,
    private readonly dataSource: DataSource,
  ) {}

  // Projects a joined license into the shared flat DTO — the only shape
  // that crosses the API boundary. All display fields are denormalized
  // here: the driver/person/class joins are always loaded by the repository.
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

  // Issues the license for a local driving license application. The whole
  // flow is ONE transaction (code-standards.md § 4): the driver
  // find-or-create, the new Licenses row, and the application completion
  // must succeed or fail together — there must never be a moment where a
  // License exists but its Driver doesn't (invariant #23), or where the
  // application stays New after a license was cut.
  async issueLicense(
    llaId: number,
    dto: IssueLicenseRequestDto,
    actingUserId: number,
  ): Promise<LicenseDto> {
    // STEP 1: The application must exist — reusing the applications
    //         service keeps the module boundary and its 404 semantics.
    const application = await this.appsService.findOne(llaId);

    // STEP 2: Only a New application can be issued — a Cancelled one is a
    //         one-way door (never walk it back), and a Completed one means
    //         the license was already issued (the unique ApplicationID on
    //         Licenses backstops the race, but a clean 409 is the honest
    //         answer for the clerk's retry).
    if (application.applicationStatus !== ApplicationStatus.NEW) {
      throw new ConflictException(
        `Cannot issue a license for a ${application.applicationStatus} application`,
      );
    }

    // STEP 3: Re-verify the pipeline server-side (invariant #22). The UI
    //         button state is presentation, not enforcement — every stage
    //         must show Passed RIGHT NOW, read fresh from the test
    //         appointments, or the issue attempt is rejected. A 409 (not
    //         a silent no-op) keeps the clerk honest about why.
    const pipeline = await this.testingService.getPipeline(llaId);
    if (!pipeline.stages.every((stage) => stage.status === 'Passed')) {
      throw new ConflictException(
        'All test stages must be passed before issuing a license',
      );
    }

    // STEP 4: The class row is the source of BOTH the fee snapshot
    //         (invariant #28) and the validity length (library-docs.md
    //         § 8) — unknown id stops here as a 404, never a null
    //         dereference later.
    const licenseClass = await this.lookupService.findLicenseClassById(
      application.licenseClassId,
    );
    if (!licenseClass) {
      throw new NotFoundException('License class not found');
    }

    // STEP 5: Everything from here is atomic. The drivers service runs its
    //         find-or-create on the SAME manager so the two inserts can
    //         never exist apart (invariant #23); the completion write goes
    //         through the applications service's transaction method for
    //         the same reason.
    const issueDate = new Date();
    const saved = await this.dataSource.transaction(async (manager) => {
      // STEP 6: Find the driver, creating their record here if this is
      //         their first license ever (invariant #23) — stamped with
      //         the session user (invariant #29), never the request body.
      const driver = await this.driversService.findOrCreateByPersonId(
        manager,
        application.personId,
        actingUserId,
      );

      // STEP 7: Guard invariant #26 — a driver may never hold two LIVE
      //         licenses of the same class. The read runs inside the
      //         transaction (not via the repository, which would use its
      //         own connection and see pre-transaction state), so a
      //         concurrent renewal-style issuance cannot slip past.
      const existingActive = await manager.findOne(License, {
        where: { driverId: driver.id, licenseClassId: licenseClass.id, isActive: true },
      });
      if (existingActive) {
        throw new ConflictException(
          `Driver already holds an active ${licenseClass.className} license`,
        );
      }

      // STEP 8: Insert the license — fee snapshotted from
      //         LicenseClasses.ClassFees at issue time (invariant #28),
      //         IssueReason = FirstTime, active by default, validity
      //         window per library-docs.md § 8 (IssueDate +
      //         DefaultValidityLength years). Nothing here is client
      //         input; even the notes pass through raw.
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

      // STEP 9: Complete the application in the same transaction — the
      //         status flip is the audit fact that the lifecycle ended
      //         normally; it must never land a second late in a separate
      //         write (a Completed application is the 5.x pipeline's
      //         one-way door).
      await this.appsService.completeInTransaction(
        manager,
        application.applicationId,
        new Date(),
      );

      return license;
    });

    // STEP 10: Reload with the join set — the insert can't populate the
    //          relations, and toDto needs them (Session 12 reload pattern).
    return this.toDto((await this.licensesRepo.findById(saved.id))!);
  }
}