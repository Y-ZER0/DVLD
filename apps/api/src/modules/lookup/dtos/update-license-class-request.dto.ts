import { IsInt, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class UpdateLicenseClassRequestDto {
  @ValidateIf((_obj, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(120)
  minimumAllowedAge?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(50)
  defaultValidityLength?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  classFees?: number;
}
