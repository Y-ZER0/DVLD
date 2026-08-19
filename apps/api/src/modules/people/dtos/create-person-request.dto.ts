import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Gender } from '@repo/shared';

export class CreatePersonRequestDto {
  @Matches(/^N-\d{8}$/, { message: 'National Number must match N-########' })
  nationalNumber: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  countryName: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}