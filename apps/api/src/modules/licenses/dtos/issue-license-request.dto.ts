import { IsOptional, IsString, MaxLength } from 'class-validator';

export class IssueLicenseRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}