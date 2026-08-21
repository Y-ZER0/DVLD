import type { Gender } from '../enums/gender.enum';
import type { TestType } from '../enums/test-type.enum';

export interface DriverDirectoryRowDto {
  driverId: number;
  fullName: string;
  email: string;
  nationalNumber: string;
  totalLicenseCount: number;
  activeLicenseCount: number;
  hasDetainedLicense: boolean;
}

export interface DriverSummaryDto {
  driverId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalNumber: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  phone: string;
  email: string;
  countryName: string;
  driverSince: string;
}

export interface DriverTestLogEntryDto {
  testId: number;
  appointmentId: number;
  applicationId: number;
  localDrivingLicenseApplicationId: number;
  testTypeId: number;
  testTypeTitle: TestType;
  appointmentDate: string;
  paidFees: string;
  isLocked: boolean;
  testResult: boolean;
  notes: string | null;
}