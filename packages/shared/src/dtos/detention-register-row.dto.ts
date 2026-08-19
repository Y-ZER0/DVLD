export interface DetentionRegisterRowDto {
  id: number;
  licenseId: number;
  driverId: number;
  driverName: string;
  nationalNumber: string;
  detainDate: string;
  fineFees: string;
  isReleased: boolean;
  releaseDate: string | null;
  totalDue: string;
}