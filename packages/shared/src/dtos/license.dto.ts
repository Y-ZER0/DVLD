import type { IssueReason } from '../enums/issue-reason.enum';

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