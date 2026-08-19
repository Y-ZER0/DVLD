import { IsInt } from 'class-validator';

export class IssueInternationalLicenseRequestDto {
  @IsInt()
  driverId: number;
}