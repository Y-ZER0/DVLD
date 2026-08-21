import { IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class UpdateApplicationTypeRequestDto {
  @ValidateIf((_obj, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  applicationFees?: number;
}
