// Application contracts (build-plan.md § 4.1). The Applications row is the
// generic audit/summary record shared by every application kind (local,
// renewals, international, release); the local driving license application
// below is this feature's projection of it. Invariant #9: defined here and
// nowhere else.
import type { ApplicationStatus, Gender } from '../enums';

// A local driving license application as the API returns it — flat and
// denormalized (Session 9 flat-DTO precedent): the applicant's display
// fields and the class name are joined server-side, so list rows and the
// detail screen never need a second call.
// id is the LocalDrivingLicenseApplications row — the route identity
// Features 5/6 (tests, issuance) hang off. applicationId is the generic
// Applications row, displayed as "App No." in the UI. paidFees is the
// ApplicationFees snapshot taken at create time (invariant #28) —
// decimal-as-string, display-only client-side. Dates are ISO strings.
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
