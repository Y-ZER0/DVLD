import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Gender } from '@repo/shared';

// CreatePersonRequestDto — backend validation shape for POST /api/people
// (invariant #10: a class with class-validator decorators, never a plain
// interface). Field set mirrors the People table exactly (architecture.md
// § schema) minus the auto-generated PersonID.
export class CreatePersonRequestDto {
  // Format enforced here so a malformed National Number never reaches the
  // database uniqueness check (invariant #25) — fail fast, cheap check
  // first. Strict uppercase: `n-12345678` is rejected, not normalized.
  @Matches(/^N-\d{8}$/, { message: 'National Number must match N-########' })
  nationalNumber: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  // 'YYYY-MM-DD' string — the date column's native wire format.
  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  // IsEmail is deliberately stricter than the column (no format check at
  // the DB level) — malformed emails are rejected before they are stored.
  @IsEmail()
  email: string;

  @IsString()
  countryName: string;

  // Photo upload is out of scope for this feature (no file infra yet) —
  // the field is carried as an optional URL string, matching the nullable
  // PhotoUrl column.
  @IsOptional()
  @IsString()
  photoUrl?: string;
}