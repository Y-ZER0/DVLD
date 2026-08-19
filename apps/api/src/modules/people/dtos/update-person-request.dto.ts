import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Gender } from '@repo/shared';

export class UpdatePersonRequestDto {
  @ValidateIf((_obj, value) => value !== undefined)
  @Matches(/^N-\d{8}$/, { message: 'National Number must match N-########' })
  nationalNumber?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsString()
  firstName?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsString()
  lastName?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsDateString()
  dateOfBirth?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsEnum(Gender)
  gender?: Gender;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsString()
  address?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsString()
  phone?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsEmail()
  email?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsString()
  countryName?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;
}