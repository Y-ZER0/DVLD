// License contracts (build-plan.md § 6.1). A Licenses row is the issued
// artifact of a completed local driving license application — the class,
// the fee snapshot taken at issue time (invariant #28), the validity
// window computed from the class's DefaultValidityLength, and the reason
// the license exists. Feature 6.1 writes it (FirstTime); Features 7/8
// reuse the same shape for renewals/replacements and international
// gating. Invariant #9: defined here and nowhere else.
import type { IssueReason } from '../enums/issue-reason.enum';

// A license as the API returns it — flat and denormalized (Session 9
// flat-DTO precedent): driver display fields and the class name are
// joined server-side. id is the Licenses row; applicationId is the
// Applications row the license completed. issueDate/expirationDate are
// 'YYYY-MM-DD' date strings (date columns, Person.dateOfBirth pattern).
// paidFees is the LicenseClasses.ClassFees snapshot taken at issue time
// (invariant #28) — decimal-as-string, display-only client-side.
export interface LicenseDto {
  id: number;
  applicationId: number;
  driverId: number;
  driverName: string;
  nationalNumber: string;
  licenseClassId: number;
  className: string;
  issueDate: string;
  expirationDate: string;
  notes: string | null;
  paidFees: string;
  isActive: boolean;
  issueReason: IssueReason;
}