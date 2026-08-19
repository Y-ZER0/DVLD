import { IsInt, IsPositive } from 'class-validator';

export class CreateLocalLicenseApplicationRequestDto {
  @IsInt()
  @IsPositive()
  personId: number;

  @IsInt()
  @IsPositive()
  licenseClassId: number;
}