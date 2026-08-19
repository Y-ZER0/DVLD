import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternationalLicense } from '../entities/international-license.entity';

export interface PaginatedInternationalLicenses {
  data: InternationalLicense[];
  meta: { total: number; page: number; pageSize: number };
}

// InternationalLicensesRepository — read-side data access for the
// international license register; writes run inside the service's transaction.
@Injectable()
export class InternationalLicensesRepository extends Repository<InternationalLicense> {
  constructor(
    @InjectRepository(InternationalLicense)
    private readonly internationalLicenseRepo: Repository<InternationalLicense>,
  ) {
    super(internationalLicenseRepo.target, internationalLicenseRepo.manager);
  }

  // Every read joins driver (+ person) — the DTO projection needs them.
  private joinedQb() {
    return this.createQueryBuilder('internationalLicense')
      .leftJoinAndSelect('internationalLicense.driver', 'driver')
      .leftJoinAndSelect('driver.person', 'person');
  }

  // Single row with the full join set; null when missing.
  async findById(id: number): Promise<InternationalLicense | null> {
    return this.joinedQb()
      .where('internationalLicense.id = :id', { id })
      .getOne();
  }

  // Paginated register, newest first (count and page share one query builder).
  async findAll(
    page: number,
    pageSize: number,
  ): Promise<PaginatedInternationalLicenses> {
    const qb = this.joinedQb();

    const total = await qb.getCount();
    const data = await qb
      .orderBy('internationalLicense.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { data, meta: { total, page, pageSize } };
  }
}