export interface InternationalLicenseDto {
  id: number;
  applicationId: number;
  driverId: number;
  driverName: string;
  nationalNumber: string;
  issuedUsingLocalLicenseId: number;
  issueDate: string;
  expirationDate: string;
  isActive: boolean;
}