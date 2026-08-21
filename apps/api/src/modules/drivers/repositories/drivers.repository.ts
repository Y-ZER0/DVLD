import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../entities/driver.entity';
import { License } from '../../licenses/entities/license.entity';
import { InternationalLicense } from '../../international-licenses/entities/international-license.entity';
import { TestAppointment } from '../../testing/entities/test-appointment.entity';

export interface DriverDirectoryRow extends Driver {
  totalLicenseCount: string;
  activeLicenseCount: string;
  hasDetainedLicense: boolean;
}

export interface PaginatedDriversDirectory {
  data: DriverDirectoryRow[];
  meta: { total: number; page: number; pageSize: number };
}

export interface DriverLocalLicenseRow extends License {
  isDetained: boolean;
}

// DriversRepository — the drivers domain's read-side data access layer: the
// directory feed (Feature 10.1) with computed license counts and the open
// detention flag, plus the three driver-scoped history reads for the detail
// screen. The join targets live in other modules' tables but are pure reads,
// so the generic TypeORM repositories are used here — no other module's
// repository class is imported.
@Injectable()
export class DriversRepository extends Repository<Driver> {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(License)
    private readonly licenseRepo: Repository<License>,
    @InjectRepository(InternationalLicense)
    private readonly internationalLicenseRepo: Repository<InternationalLicense>,
    @InjectRepository(TestAppointment)
    private readonly testAppointmentRepo: Repository<TestAppointment>,
  ) {
    super(driverRepo.target, driverRepo.manager);
  }

  // Directory builder: person join + three opt-in scalar columns — total
  // and active license counts (correlated subqueries) and the open
  // detention EXISTS mirroring the licenses register's isDetained flag;
  // count/page share the builder so meta.total always matches the rows.
  private directoryQb() {
    return this.createQueryBuilder('driver')
      .leftJoinAndSelect('driver.person', 'person')
      .addSelect(
        '(SELECT COUNT(*) FROM "Licenses" l WHERE l."DriverID" = driver.id)',
        'driver_totalLicenseCount',
      )
      .addSelect(
        '(SELECT COUNT(*) FROM "Licenses" l WHERE l."DriverID" = driver.id AND l."IsActive" = true)',
        'driver_activeLicenseCount',
      )
      .addSelect(
        'EXISTS (SELECT 1 FROM "DetainedLicenses" detention JOIN "Licenses" detention_license ' +
          'ON detention_license."LicenseID" = detention."LicenseID" ' +
          'WHERE detention_license."DriverID" = driver.id AND detention."IsReleased" = false)',
        'driver_hasDetainedLicense',
      );
  }

  // Wraps raw/entity pairs with the scalar flags so the service can project
  // the flat directory DTO.
  private mapDirectoryRows(entities: Driver[], raw: Array<Record<string, unknown>>): DriverDirectoryRow[] {
    return entities.map((driver, index) => {
      const row = raw[index]!;
      return {
        ...driver,
        totalLicenseCount: String(row.driver_totalLicenseCount),
        activeLicenseCount: String(row.driver_activeLicenseCount),
        hasDetainedLicense: row.driver_hasDetainedLicense as boolean,
      };
    });
  }

  // Every driver, newest first — the 10.2 directory table's feed.
  async findAll(page: number, pageSize: number): Promise<PaginatedDriversDirectory> {
    const qb = this.directoryQb();

    const total = await qb.getCount();
    const { entities, raw } = await qb
      .orderBy('driver.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawAndEntities();

    return {
      data: this.mapDirectoryRows(entities, raw),
      meta: { total, page, pageSize },
    };
  }

  // Free-text search across driver id, national number, and full name —
  // one case-insensitive LIKE per column, including the concatenated form.
  async search(
    term: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedDriversDirectory> {
    const qb = this.directoryQb().where(
      '(CAST(driver.id AS varchar) LIKE :like OR LOWER(person.nationalNumber) LIKE :like ' +
        'OR LOWER(person.firstName) LIKE :like OR LOWER(person.lastName) LIKE :like ' +
        "OR LOWER(person.firstName || ' ' || person.lastName) LIKE :like)",
      { like: `%${term.toLowerCase()}%` },
    );

    const total = await qb.getCount();
    const { entities, raw } = await qb
      .orderBy('driver.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawAndEntities();

    return {
      data: this.mapDirectoryRows(entities, raw),
      meta: { total, page, pageSize },
    };
  }

  // Single driver with the person join; null when missing (the service owns
  // the 404 for every driver-scoped endpoint).
  async findById(id: number): Promise<Driver | null> {
    return this.createQueryBuilder('driver')
      .leftJoinAndSelect('driver.person', 'person')
      .where('driver.id = :id', { id })
      .getOne();
  }

  // Every local license of one driver, newest first, with the computed
  // isDetained flag — the local history tab's source (same register-shape
  // projection the 7.2 screen renders).
  async findLocalLicenseHistory(driverId: number): Promise<DriverLocalLicenseRow[]> {
    const qb = this.licenseRepo
      .createQueryBuilder('license')
      .leftJoinAndSelect('license.driver', 'driver')
      .leftJoinAndSelect('driver.person', 'person')
      .leftJoinAndSelect('license.licenseClass', 'licenseClass')
      .addSelect(
        'EXISTS (SELECT 1 FROM "DetainedLicenses" detention ' +
          'WHERE detention."LicenseID" = license.id AND detention."IsReleased" = false)',
        'license_isDetained',
      )
      .where('license.driverId = :driverId', { driverId })
      .orderBy('license.id', 'DESC');

    const { entities, raw } = await qb.getRawAndEntities();
    return entities.map((license, index) => ({
      ...license,
      isDetained: raw[index].license_isDetained as boolean,
    }));
  }

  // Every international license of one driver, newest first — the
  // international history tab's source (Feature 8 register shape).
  async findInternationalHistory(driverId: number): Promise<InternationalLicense[]> {
    return this.internationalLicenseRepo
      .createQueryBuilder('internationalLicense')
      .leftJoinAndSelect('internationalLicense.driver', 'driver')
      .leftJoinAndSelect('driver.person', 'person')
      .where('internationalLicense.driverId = :driverId', { driverId })
      .orderBy('internationalLicense.id', 'DESC')
      .getMany();
  }

  // Every recorded test of one person, newest first — the test log tab's
  // source. Tests reach the driver through their LocalDrivingLicenseApplication
  // → Application → applicant Person, which is the driver's own person.
  async findTestLog(personId: number): Promise<TestAppointment[]> {
    return this.testAppointmentRepo
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.testType', 'testType')
      .leftJoinAndSelect('appointment.test', 'test')
      .leftJoinAndSelect('appointment.lla', 'lla')
      .leftJoinAndSelect('lla.application', 'application')
      .innerJoin('application.person', 'person')
      .where('person.id = :personId', { personId })
      .andWhere('test.id IS NOT NULL')
      .orderBy('appointment.id', 'DESC')
      .getMany();
  }
}