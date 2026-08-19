import type { IssueReason } from '../enums/issue-reason.enum';

export interface LicenseRegisterRowDto {
  id: number;
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
  isDetained: boolean;
  issueReason: IssueReason;
}
