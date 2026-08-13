import {
  IsInt,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// CreateUserRequestDto — payload for POST /users (build-plan.md § 2.1).
// Links an existing People row to a brand-new login account. personId
// must reference a person who exists and has no account yet — both
// checks live in UsersService (404 / 409), not here.
export class CreateUserRequestDto {
  // STEP 1: personId — must be a valid positive integer; the service
  //         verifies the referenced person exists (404) and has no User
  //         row yet (409), because those answers need the database.
  @IsInt()
  @IsPositive()
  personId: number;

  // STEP 2: username — format-checked so a login handle can never carry
  //         spaces or symbols that would break the sign-in UX; the
  //         uniqueness check runs in the service (409) against the
  //         unique Username column.
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Username may only contain letters, numbers, dots, dashes and underscores',
  })
  username: string;

  // STEP 3: password — MinLength 8 / MaxLength 72 (bcrypt's byte limit,
  //         library-docs.md § 3). Complexity is a UX decision, not a
  //         schema rule. Hashed with cost factor 12 in the service —
  //         never stored or returned plaintext (invariant #15).
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
