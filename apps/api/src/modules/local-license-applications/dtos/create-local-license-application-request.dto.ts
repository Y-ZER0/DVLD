import { IsInt, IsPositive } from 'class-validator';

// CreateLocalLicenseApplicationRequestDto — payload for POST
// /local-license-applications (build-plan.md § 4.1). The applicant's
// eligibility (age vs. the class's MinimumAllowedAge) is verified in the
// service against People.dateOfBirth + LicenseClasses.MinimumAllowedAge
// (library-docs.md § 2) — it cannot live here because it needs two records.
// The fee is never accepted from the client: it is snapshotted server-side
// at create time (invariant #28).
export class CreateLocalLicenseApplicationRequestDto {
  // STEP 1: personId — the applicant. Must be a valid positive integer;
  //         the service verifies the citizen exists (404) and is old
  //         enough for the chosen class (400).
  @IsInt()
  @IsPositive()
  personId: number;

  // STEP 2: licenseClassId — the class being applied for. The service
  //         resolves it (404 if unknown) and gates on its
  //         MinimumAllowedAge.
  @IsInt()
  @IsPositive()
  licenseClassId: number;
}