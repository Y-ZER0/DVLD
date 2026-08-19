import { IsInt, IsNumber, IsPositive, Max, Min } from 'class-validator';

export class DetainLicenseRequestDto {
  @IsInt()
  @IsPositive()
  licenseId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  fineFees: number;
}