import type { ApplicationStatus, Gender } from '../enums';

export interface LocalDrivingLicenseApplicationDto {
  id: number;
  applicationId: number;
  personId: number;
  applicantName: string;
  nationalNumber: string;
  dateOfBirth: string;
  gender: Gender;
  licenseClassId: number;
  className: string;
  applicationStatus: ApplicationStatus;
  paidFees: string;
  applicationDate: string;
  lastStatusDate: string;
}
