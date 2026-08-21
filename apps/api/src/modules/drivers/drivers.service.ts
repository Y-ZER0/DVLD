import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  DriverDirectoryRowDto,
  DriverSummaryDto,
  DriverTestLogEntryDto,
  InternationalLicenseDto,
  LicenseRegisterRowDto,
} from '@repo/shared';
import { Driver } from './entities/driver.entity';
import {
  DriverDirectoryRow,
  DriverLocalLicenseRow,
  DriversRepository,
  PaginatedDriversDirectory,
} from './repositories/drivers.repository';
import { InternationalLicense } from '../international-licenses/entities/international-license.entity';
import { TestAppointment } from '../testing/entities/test-appointment.entity';

// DriversService — the drivers domain (Feature 10.1): the transactional
// find-or-create used by license issuance (invariant #23) plus the read-only
// directory and history views that aggregate licenses, international
// licenses, and tests into the 10.2 screens' data surface.
@Injectable()
export class DriversService {
  constructor(private readonly driversRepo: DriversRepository) {}

  // Finds the person's driver row, creating it if missing. Runs on the
  // caller's EntityManager so the create participates in the caller's
  // transaction; the DB's unique PersonID backstops concurrent creates.
  async findOrCreateByPersonId(
    manager: EntityManager,
    personId: number,
    actingUserId: number,
  ): Promise<Driver> {
    // Common path: the person already has a driver row.
    const existing = await manager.findOne(Driver, { where: { personId } });
    if (existing) {
      return existing;
    }

    // First license ever — create the driver row in the caller's transaction.
    return manager.save(
      manager.create(Driver, {
        personId,
        createdByUserId: actingUserId,
        createdDate: new Date(),
      }),
    );
  }

  // Projects a directory row into the flat DTO; the Status pill derives from
  // hasDetainedLicense, the Licenses column from the two counts.
  private toDirectoryDto(row: DriverDirectoryRow): DriverDirectoryRowDto {
    return {
      driverId: row.id,
      fullName: `${row.person.firstName} ${row.person.lastName}`,
      email: row.person.email,
      nationalNumber: row.person.nationalNumber,
      totalLicenseCount: Number(row.totalLicenseCount),
      activeLicenseCount: Number(row.activeLicenseCount),
      hasDetainedLicense: row.hasDetainedLicense,
    };
  }

  // Projects the driver + person into the summary card's shape; DriverID and
  // CreatedDate ("Driver Since") come from the driver row itself.
  private toSummaryDto(driver: Driver): DriverSummaryDto {
    return {
      driverId: driver.id,
      firstName: driver.person.firstName,
      lastName: driver.person.lastName,
      fullName: `${driver.person.firstName} ${driver.person.lastName}`,
      nationalNumber: driver.person.nationalNumber,
      dateOfBirth: driver.person.dateOfBirth,
      gender: driver.person.gender,
      address: driver.person.address,
      phone: driver.person.phone,
      email: driver.person.email,
      countryName: driver.person.countryName,
      driverSince: driver.createdDate.toISOString(),
    };
  }

  // Local-license history reuses the 7.2 register row shape — the local tab's
  // columns (License, Class, Issue Reason, Issued, Expires, Fees, Status) are
  // exactly the register's, plus the isDetained flag for the three-pill Status.
  private toLocalLicenseDto(row: DriverLocalLicenseRow): LicenseRegisterRowDto {
    return {
      id: row.id,
      driverId: row.driverId,
      driverName: `${row.driver.person.firstName} ${row.driver.person.lastName}`,
      nationalNumber: row.driver.person.nationalNumber,
      licenseClassId: row.licenseClassId,
      className: row.licenseClass.className,
      issueDate: row.issueDate,
      expirationDate: row.expirationDate,
      notes: row.notes,
      paidFees: row.paidFees,
      isActive: row.isActive,
      isDetained: row.isDetained,
      issueReason: row.issueReason,
    };
  }

  // International history reuses the Feature 8 register DTO — same column set,
  // filtered to the driver.
  private toInternationalDto(
    row: InternationalLicense,
  ): InternationalLicenseDto {
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

  // Test log: one entry per recorded test, carrying the locked/appointment
  // metadata the tab needs (stage, date, lock state, fee, verdict).
  private toTestLogEntryDto(a: TestAppointment): DriverTestLogEntryDto {
    return {
      testId: a.test!.id,
      appointmentId: a.id,
      applicationId: a.lla.application.id,
      localDrivingLicenseApplicationId: a.llaId,
      testTypeId: a.testTypeId,
      testTypeTitle: a.testType.testTypeTitle,
      appointmentDate: a.appointmentDate.toISOString(),
      paidFees: a.paidFees,
      isLocked: a.isLocked,
      testResult: a.test!.testResult,
      notes: a.test!.notes,
    };
  }

  // Loads the driver for every driver-scoped history endpoint; the 404 is
  // shared so a missing driver never degrades into an empty-looking page.
  private async requireDriver(driverId: number): Promise<Driver> {
    const driver = await this.driversRepo.findById(driverId);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }

  // Paginated directory of every driver, newest first — the 10.2 table feed.
  async getDirectory(
    page: number,
    pageSize: number,
  ): Promise<{ data: DriverDirectoryRowDto[]; meta: PaginatedDriversDirectory['meta'] }> {
    const { data, meta } = await this.driversRepo.findAll(page, pageSize);
    return { data: data.map((row) => this.toDirectoryDto(row)), meta };
  }

  // Paginated directory filtered by driver id / national number / name.
  async searchDirectory(
    term: string,
    page: number,
    pageSize: number,
  ): Promise<{ data: DriverDirectoryRowDto[]; meta: PaginatedDriversDirectory['meta'] }> {
    const { data, meta } = await this.driversRepo.search(term, page, pageSize);
    return { data: data.map((row) => this.toDirectoryDto(row)), meta };
  }

  // Profile summary card data (person fields + DriverID + Driver Since).
  async getSummary(driverId: number): Promise<DriverSummaryDto> {
    const driver = await this.requireDriver(driverId);
    return this.toSummaryDto(driver);
  }

  // Every local license the driver has ever held, newest first.
  async getLocalLicenseHistory(
    driverId: number,
  ): Promise<LicenseRegisterRowDto[]> {
    const driver = await this.requireDriver(driverId);
    const rows = await this.driversRepo.findLocalLicenseHistory(driver.id);
    return rows.map((row) => this.toLocalLicenseDto(row));
  }

  // Every international license the driver has ever held, newest first.
  async getInternationalHistory(
    driverId: number,
  ): Promise<InternationalLicenseDto[]> {
    const driver = await this.requireDriver(driverId);
    const rows = await this.driversRepo.findInternationalHistory(driver.id);
    return rows.map((row) => this.toInternationalDto(row));
  }

  // Every test the driver has ever taken, across every application, newest
  // first — the tests link to the driver through their own person.
  async getTestLog(driverId: number): Promise<DriverTestLogEntryDto[]> {
    const driver = await this.requireDriver(driverId);
    const appointments = await this.driversRepo.findTestLog(driver.personId);
    return appointments.map((a) => this.toTestLogEntryDto(a));
  }
}