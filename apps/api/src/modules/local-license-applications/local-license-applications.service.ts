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
import { Application } from './entities/application.entity';
import { LocalDrivingLicenseApplication } from './entities/local-driving-license-application.entity';
import {
  FindAllLocalLicenseApplicationsParams,
  LocalLicenseApplicationsRepository,
  PaginatedLocalLicenseApplications,
} from './repositories/local-license-applications.repository';
import { CreateLocalLicenseApplicationRequestDto } from './dtos/create-local-license-application-request.dto';

// LocalLicenseApplicationsService — the applications domain's business
// rules (build-plan.md § 4.1): every application files for exactly one
// license class, the applicant must meet that class's minimum age
// (library-docs.md § 2), the fee is snapshotted from the current
// ApplicationTypes config (invariant #28), and the status lifecycle is
// strictly New → Cancelled | Completed. Entities never leave this module
// (invariant #11): every return path projects through toDto().
@Injectable()
export class LocalLicenseApplicationsService {
  constructor(
    private readonly appsRepo: LocalLicenseApplicationsRepository,
    private readonly peopleService: PeopleService,
    private readonly lookupService: LookupService,
    private readonly dataSource: DataSource,
  ) {}

  // Projects a joined entity into the shared flat DTO — the only shape
  // that crosses the API boundary. All display fields are denormalized
  // here: the relation joins are always loaded by the repository.
  private toDto(lla: LocalDrivingLicenseApplication): LocalDrivingLicenseApplicationDto {
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
    };
  }

  // Paginated + filterable register for the 4.2 list screen — thin
  // pass-through of the repository result, projected row by row.
  async findAll(
    params: FindAllLocalLicenseApplicationsParams,
  ): Promise<{ data: LocalDrivingLicenseApplicationDto[]; meta: PaginatedLocalLicenseApplications['meta'] }> {
    // STEP 1: Fetch the page entities (joins + filters + window all owned
    //         by the repository, so rows and meta agree), then map every
    //         row across the toDto gate (invariant #11).
    const { data, meta } = await this.appsRepo.findAll(params);
    return { data: data.map((lla) => this.toDto(lla)), meta };
  }

  // Single-application lookup for the detail screen (and Features 5/6's
  // attach point later) — 404 when no such application exists.
  async findOne(id: number): Promise<LocalDrivingLicenseApplicationDto> {
    // STEP 1: Load with the full join set first — a missing id is a 404,
    //         and every return path here needs the joined display fields.
    const lla = await this.appsRepo.findById(id);
    if (!lla) {
      throw new NotFoundException('Local driving license application not found');
    }
    return this.toDto(lla);
  }

  // Files a new local driving license application: verifies the applicant
  // exists and meets the chosen class's minimum age, snapshots the
  // NewDrivingLicense application fee, and writes BOTH rows (Applications +
  // LocalDrivingLicenseApplications) atomically — the parent record and
  // its kind-specific child must never exist apart from each other.
  async create(
    dto: CreateLocalLicenseApplicationRequestDto,
    actingUserId: number,
  ): Promise<LocalDrivingLicenseApplicationDto> {
    // STEP 1: The applicant must be a real citizen — reusing PeopleService
    //         keeps the people domain's own 404 semantics (and the module
    //         boundary; cross-module reads go through its exported service).
    const person = await this.peopleService.findOne(dto.personId);

    // STEP 2: The license class must exist — the age gate below answers
    //         against its MinimumAllowedAge, so an unknown id must stop
    //         here as a clean 404 rather than a later null dereference.
    const licenseClass = await this.lookupService.findLicenseClassById(
      dto.licenseClassId,
    );
    if (!licenseClass) {
      throw new NotFoundException('License class not found');
    }

    // STEP 3: Age gate (library-docs.md § 2): the applicant must have
    //         reached the class's MinimumAllowedAge by today. parseISO
    //         treats the 'YYYY-MM-DD' dob as local midnight so the
    //         year-count is calendar-accurate around birthdays (the
    //         UTC-midnight interpretation could shift the answer by a day).
    const age = differenceInYears(new Date(), parseISO(person.dateOfBirth));
    if (age < licenseClass.minimumAllowedAge) {
      throw new BadRequestException(
        `Applicant must be at least ${licenseClass.minimumAllowedAge} to apply for ${licenseClass.className}`,
      );
    }

    // STEP 4: Fee source = the seeded NewDrivingLicense application type
    //         (invariant #28: read at transaction time, never from the
    //         client, never hardcoded). A missing row is a configuration
    //         error — fail loud rather than inventing a fee.
    const applicationType = await this.lookupService.findApplicationTypeByTitle(
      ApplicationType.NEW_DRIVING_LICENSE,
    );
    if (!applicationType) {
      throw new NotFoundException(
        'New Driving License application type is not configured',
      );
    }

    // STEP 5: Write both rows in ONE transaction (code-standards § 4): a
    //         LocalDrivingLicenseApplications row without its Applications
    //         parent (or vice versa) would corrupt the status/fee model
    //         every later feature reads.
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

      // STEP 6: Chain the child row to the freshly generated parent id —
      //         the one-to-one a later feature will hang tests off.
      const localApp = manager.create(LocalDrivingLicenseApplication, {
        applicationId: savedApplication.id,
        licenseClassId: dto.licenseClassId,
      });
      return manager.save(localApp);
    });

    // STEP 7: Reload with the join set — the insert can't populate the
    //         relations, and toDto needs them (same reload pattern as
    //         UsersService.create).
    return this.toDto(await this.appsRepo.findById(lla.id).then((row) => row!));
  }

  // Cancels a New application (status → Cancelled). This is a one-way
  // door: Completed applications are final (Feature 6 issuance), and
  // re-cancelling is a client error, both surfaced as 409 — a cancellation
  // must not silently double-fire or walk back a completion.
  async cancel(id: number): Promise<LocalDrivingLicenseApplicationDto> {
    // STEP 1: Load the row (with its parent application) so we can read
    //         the current status and can 404 cleanly when it's missing.
    const lla = await this.appsRepo.findById(id);
    if (!lla) {
      throw new NotFoundException('Local driving license application not found');
    }

    // STEP 2: Only a New application may be cancelled — a Cancelled or
    //         Completed one must not be flipped backwards (409, not a
    //         silent no-op, so the UI can surface the mistake).
    if (lla.application.applicationStatus !== ApplicationStatus.NEW) {
      throw new ConflictException(
        `Only a new application can be cancelled (current status: ${lla.application.applicationStatus})`,
      );
    }

    // STEP 3: Persist the transition, stamping LastStatusDate so the
    //         status-change trail stays auditable.
    await this.appsRepo.updateApplicationStatus(
      lla.applicationId,
      ApplicationStatus.CANCELLED,
      new Date(),
    );

    // STEP 4: Reload and project through toDto — the caller receives the
    //         Cancelled row as its response.
    const updated = await this.appsRepo.findById(id);
    return this.toDto(updated!);
  }

  // Marks an application Completed inside the caller's transaction —
  // license issuance's final step (Feature 6.1). The manager is passed in
  // deliberately (same pattern as DriversService.findOrCreateByPersonId):
  // the completion must be ATOMIC with the Licenses insert (a license
  // existing while its application still reads New would be a corrupted
  // lifecycle state), so the write runs on the caller's transaction, never
  // on a repository's own connection.
  async completeInTransaction(
    manager: EntityManager,
    applicationId: number,
    completedAt: Date,
  ): Promise<void> {
    // STEP 1: Flip the status and stamp LastStatusDate in one update —
    //         mirroring the cancel() semantics: every status change
    //         leaves an auditable timestamp.
    await manager.update(
      Application,
      { id: applicationId },
      { applicationStatus: ApplicationStatus.COMPLETED, lastStatusDate: completedAt },
    );
  }
}