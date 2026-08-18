import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStatus } from '@repo/shared';
import { Application } from '../entities/application.entity';
import { LocalDrivingLicenseApplication } from '../entities/local-driving-license-application.entity';

// Query params accepted by findAll — page/pageSize drive pagination,
// search is the free-text filter (applicant name/national number) and
// status narrows to New/Cancelled/Completed rows.
export interface FindAllLocalLicenseApplicationsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ApplicationStatus;
}

export interface PaginatedLocalLicenseApplications {
  data: LocalDrivingLicenseApplication[];
  meta: { total: number; page: number; pageSize: number };
}

// LocalLicenseApplicationsRepository — the applications domain's data
// access layer. Extends Repository (PeopleRepository/UsersRepository
// pattern); pure TypeORM calls only — business rules (age gate, status
// transitions, fee snapshot) live in the service.
@Injectable()
export class LocalLicenseApplicationsRepository extends Repository<LocalDrivingLicenseApplication> {
  constructor(
    @InjectRepository(LocalDrivingLicenseApplication)
    private readonly localRepo: Repository<LocalDrivingLicenseApplication>,
  ) {
    // STEP 1: Expose the decorated repository as the inherited base so
    //         callers get the full TypeORM Repository surface plus the
    //         custom methods below.
    super(localRepo.target, localRepo.manager);
  }

  // Every query joins the parent Applications row (with its People row)
  // and the LicenseClasses row — the DTO needs applicantName/
  // nationalNumber/className and the status/fees/dates on all return paths,
  // so the join is always-on rather than sprinkled per method.
  private joinedQb() {
    return this.createQueryBuilder('lla')
      .leftJoinAndSelect('lla.application', 'application')
      .leftJoinAndSelect('application.person', 'person')
      .leftJoinAndSelect('lla.licenseClass', 'licenseClass');
  }

  // Paginated application register: one optional free-text search across
  // the applicant's name/national number, one optional status filter,
  // newest first. One query builder so meta.total always matches the rows
  // returned (same contract as GET /people and GET /users).
  async findAll(
    params: FindAllLocalLicenseApplicationsParams,
  ): Promise<PaginatedLocalLicenseApplications> {
    // STEP 1: Build the joined, filtered query — the WHERE clauses below
    //         apply to the same qb the count will run on, so the page
    //         rows and meta.total can never disagree.
    const qb = this.joinedQb();

    // STEP 2: Free-text search parameter (same LOWER/LIKE contract as the
    //         People and Users registers) matched against the applicant's
    //         display fields.
    if (params.search) {
      const like = `%${params.search.toLowerCase()}%`;
      qb.where(
        '(LOWER(person.firstName) LIKE :like OR LOWER(person.lastName) LIKE :like ' +
          'OR LOWER(person.nationalNumber) LIKE :like)',
        { like },
      );
    }

    // STEP 3: Optional exact status filter — the application is New,
    //         Cancelled, or Completed; the enum label IS the stored value.
    if (params.status) {
      qb.andWhere('application.applicationStatus = :status', {
        status: params.status,
      });
    }

    // STEP 4: total from the filtered qb, then the page window — newest
    //         first (ordering by the parent application id matches the
    //         "App No." displayed in the UI).
    const total = await qb.getCount();
    const data = await qb
      .orderBy('application.id', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getMany();

    return { data, meta: { total, page: params.page, pageSize: params.pageSize } };
  }

  // Single-application lookup with the full join set — the detail screen's
  // data source. Returns null so the service decides the 404.
  async findById(id: number): Promise<LocalDrivingLicenseApplication | null> {
    // STEP 1: Only one row per id; the joined projections come along in
    //         the same query (no second trip needed for the DTO).
    return this.joinedQb().where('lla.id = :id', { id }).getOne();
  }

  // Status transition on the parent Applications row. Only the service
  // may call this — cancellation (New → Cancelled, Feature 4) and later
  // completion (Feature 6) are the two legal transitions.
  async updateApplicationStatus(
    applicationId: number,
    status: ApplicationStatus,
    lastStatusDate: Date,
  ): Promise<void> {
    // STEP 1: The status column lives on Applications, not on the local
    //         row — this repo is the only data-access surface this module
    //         exposes, so the manager update goes through here in place of
    //         a second repository.
    await this.manager.update(
      Application,
      { id: applicationId },
      { applicationStatus: status, lastStatusDate },
    );
  }
}