import { IsOptional, IsString, MaxLength } from 'class-validator';

// IssueLicenseRequestDto — payload for POST
// /local-license-applications/:id/issue-license (build-plan.md § 6.1).
// Deliberately empty of everything the server must decide: the pipeline
// gate (invariant #22), the fee snapshot (invariant #28) and the session
// identity (invariant #29) are service concerns. The only input is the
// clerk's optional note.
export class IssueLicenseRequestDto {
  // STEP 1: notes — clerk's free text from the issue modal; explicitly
  //         optional and length-capped (same 500 ceiling as the 5.1
  //         examiner notes).
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}