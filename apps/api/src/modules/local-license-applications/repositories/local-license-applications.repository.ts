import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStatus } from '@repo/shared';
import { Application } from '../entities/application.entity';
import { LocalDrivingLicenseApplication } from '../entities/local-driving-license-application.entity';

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

// LocalLicenseApplicationsRepository — the applications domain's data access layer.
@Injectable()
export class LocalLicenseApplicationsRepository extends Repository<LocalDrivingLicenseApplication> {
  constructor(
    @InjectRepository(LocalDrivingLicenseApplication)
    private readonly localRepo: Repository<LocalDrivingLicenseApplication>,
  ) {
    super(localRepo.target, localRepo.manager);
  }

  // Every query joins the parent Applications row (with its People row) and
  // the LicenseClasses row — the DTO needs them on all return paths.
  private joinedQb() {
    return this.createQueryBuilder('lla')
      .leftJoinAndSelect('lla.application', 'application')
      .leftJoinAndSelect('application.person', 'person')
      .leftJoinAndSelect('lla.licenseClass', 'licenseClass');
  }

  // Paginated register: optional free-text search across the applicant,
  // optional status filter; count and page share one query builder.
  async findAll(
    params: FindAllLocalLicenseApplicationsParams,
  ): Promise<PaginatedLocalLicenseApplications> {
    const qb = this.joinedQb();

    if (params.search) {
      const like = `%${params.search.toLowerCase()}%`;
      qb.where(
        '(LOWER(person.firstName) LIKE :like OR LOWER(person.lastName) LIKE :like ' +
          'OR LOWER(person.nationalNumber) LIKE :like)',
        { like },
      );
    }

    // Exact status filter; the enum label IS the stored value.
    if (params.status) {
      qb.andWhere('application.applicationStatus = :status', {
        status: params.status,
      });
    }

    const total = await qb.getCount();
    // Newest first by the parent application id; skip/take implement the page window.
    const data = await qb
      .orderBy('application.id', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getMany();

    return { data, meta: { total, page: params.page, pageSize: params.pageSize } };
  }

  // Single-application lookup with the full join set; null when missing.
  async findById(id: number): Promise<LocalDrivingLicenseApplication | null> {
    return this.joinedQb().where('lla.id = :id', { id }).getOne();
  }

  // Status transition on the parent Applications row, stamping lastStatusDate.
  async updateApplicationStatus(
    applicationId: number,
    status: ApplicationStatus,
    lastStatusDate: Date,
  ): Promise<void> {
    await this.manager.update(
      Application,
      { id: applicationId },
      { applicationStatus: status, lastStatusDate },
    );
  }
}