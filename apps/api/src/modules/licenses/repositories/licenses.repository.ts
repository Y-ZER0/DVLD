import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { License } from '../entities/license.entity';

export interface RegisterLicenseRow extends License {
  isDetained: boolean;
}

export interface PaginatedLicensesRegister {
  data: RegisterLicenseRow[];
  meta: { total: number; page: number; pageSize: number };
}

export interface PaginatedActiveCarLicenses {
  data: License[];
  meta: { total: number; page: number; pageSize: number };
}

// LicensesRepository — the licenses domain's read-side data access layer;
// transactional writes go through the service's transaction manager.
@Injectable()
export class LicensesRepository extends Repository<License> {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepo: Repository<License>,
  ) {
    super(licenseRepo.target, licenseRepo.manager);
  }

  // Every read joins driver (+ person) and license class — the DTO projection
  // needs them on all return paths.
  private joinedQb() {
    return this.createQueryBuilder('license')
      .leftJoinAndSelect('license.driver', 'driver')
      .leftJoinAndSelect('driver.person', 'person')
      .leftJoinAndSelect('license.licenseClass', 'licenseClass');
  }

  // Single license with the full join set; null when missing.
  async findById(id: number): Promise<License | null> {
    return this.joinedQb().where('license.id = :id', { id }).getOne();
  }

  // Paginated register of every local license, newest first, with a computed
  // isDetained flag (open detention EXISTS subquery — opt-in addSelect, so the
  // count query stays selects-free); raw+entities pairs row-for-row.
  async findAllForRegister(
    page: number,
    pageSize: number,
  ): Promise<PaginatedLicensesRegister> {
    const qb = this.joinedQb().addSelect(
      'EXISTS (SELECT 1 FROM "DetainedLicenses" detention ' +
        'WHERE detention."LicenseID" = license.id AND detention."IsReleased" = false)',
      'license_isDetained',
    );

    const total = await qb.getCount();
    const { entities, raw } = await qb
      .orderBy('license.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawAndEntities();

    const data = entities.map((license, index) => ({
      ...license,
      isDetained: raw[index].license_isDetained,
    }));

    return { data, meta: { total, page, pageSize } };
  }

  // Active, unexpired licenses of one class, newest first — the
  // international feature's eligibility source (invariant #24 + expiry gate).
  async findActiveCarLicenses(
    licenseClassId: number,
    page: number,
    pageSize: number,
    today: string,
  ): Promise<PaginatedActiveCarLicenses> {
    const qb = this.joinedQb()
      .where('license.licenseClassId = :licenseClassId', { licenseClassId })
      .andWhere('license.isActive = :isActive', { isActive: true })
      .andWhere('license.expirationDate >= :today', { today });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('license.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { data, meta: { total, page, pageSize } };
  }

  // Active, unexpired licenses with no open detention, newest first — the
  // detention feature's eligibility source (Feature 9.1): the NOT EXISTS over
  // the detention table excludes already-detained licenses, mirroring the
  // register's isDetained flag predicate.
  async findActiveLicensesWithoutOpenDetention(
    page: number,
    pageSize: number,
    today: string,
  ): Promise<PaginatedActiveCarLicenses> {
    const qb = this.joinedQb()
      .where('license.isActive = :isActive', { isActive: true })
      .andWhere('license.expirationDate >= :today', { today })
      .andWhere(
        'NOT EXISTS (SELECT 1 FROM "DetainedLicenses" detention ' +
          'WHERE detention."LicenseID" = license.id AND detention."IsReleased" = false)',
      );

    const total = await qb.getCount();
    const data = await qb
      .orderBy('license.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { data, meta: { total, page, pageSize } };
  }
}