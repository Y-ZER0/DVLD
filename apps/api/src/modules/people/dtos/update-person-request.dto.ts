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

// UpdatePersonRequestDto — backend validation shape for PATCH /api/people/:id.
// True partial update: every field is optional, and only the fields actually
// present in the body are validated and applied — a clerk editing just the
// phone number must not re-submit the whole citizen record. National Number
// is validated only when it is being changed; the service then re-checks
// uniqueness excluding the row being edited (see people.service.ts).
//
// Fields use @ValidateIf(v => v !== undefined) instead of @IsOptional():
// undefined (field omitted) skips validation, but null is still rejected by
// the type validator below it → 400. A bare @IsOptional() would let null
// through to the DB, where a NOT NULL column would turn into a 500.
export class UpdatePersonRequestDto {
  // Format enforced here so a malformed National Number never reaches the
  // database uniqueness check (invariant #25) — strict uppercase, same
  // contract as create.
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

  // photoUrl is the deliberate exception: null here is legal (it clears the
  // photo on the nullable PhotoUrl column), so it keeps @IsOptional() —
  // omitted = unchanged, null = cleared (handled in people.service.ts).
  @IsOptional()
  @IsString()
  photoUrl?: string | null;
}