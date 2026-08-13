import { IsString, MaxLength, MinLength } from 'class-validator';

// UpdateUserPasswordRequestDto — payload for PATCH /users/:id/password
// (build-plan.md § 2.1). Single-field body, matching the 2.2
// UpdatePasswordModal's one "New Password" input — the clerk acts on
// behalf of the account holder, so no old-password step exists.
export class UpdateUserPasswordRequestDto {
  // Same rules as CreateUserRequestDto.password: MinLength 8 /
  // MaxLength 72 (bcrypt's byte limit). Re-hashed with cost 12 in the
  // service before persist (invariant #15 — never plaintext in the DB).
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}