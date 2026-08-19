import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetainedLicense } from '../entities/detained-license.entity';

export interface PaginatedDetentions {
  data: DetainedLicense[];
  meta: { total: number; page: number; pageSize: number };
}

// DetainedLicensesRepository — the detention domain's read-side data access;
// transactional writes go through the service's transaction manager.
@Injectable()
export class DetainedLicensesRepository extends Repository<DetainedLicense> {
  constructor(
    @InjectRepository(DetainedLicense)
    private readonly detainedLicenseRepo: Repository<DetainedLicense>,
  ) {
    super(detainedLicenseRepo.target, detainedLicenseRepo.manager);
  }

  // Every read joins the license, driver, and person — the register DTO
  // projection needs them on all return paths.
  private joinedQb() {
    return this.createQueryBuilder('detainedLicense')
      .leftJoinAndSelect('detainedLicense.license', 'license')
      .leftJoinAndSelect('license.driver', 'driver')
      .leftJoinAndSelect('driver.person', 'person');
  }

  // Single detention with the full join set; null when missing.
  async findById(id: number): Promise<DetainedLicense | null> {
    return this.joinedQb()
      .where('detainedLicense.id = :id', { id })
      .getOne();
  }

  // Paginated register of every detention, newest first (released rows stay
  // in the audit trail — the Feature 10 history source).
  async findAllForRegister(
    page: number,
    pageSize: number,
  ): Promise<PaginatedDetentions> {
    const qb = this.joinedQb();

    const total = await qb.getCount();
    const data = await qb
      .orderBy('detainedLicense.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { data, meta: { total, page, pageSize } };
  }
}