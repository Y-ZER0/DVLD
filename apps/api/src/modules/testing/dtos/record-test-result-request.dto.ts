import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

// The two legal verdicts an examiner can record — the DTO keeps them as
// words ('passed'/'failed', code-standards.md § 5 worked example); the
// service maps to the boolean Test.testResult column.
export const TEST_RESULT_VALUES = ['passed', 'failed'] as const;
export type TestResultValue = (typeof TEST_RESULT_VALUES)[number];

// RecordTestResultRequestDto — payload for PATCH
// /test-appointments/:id/result (build-plan.md § 5.1). The lock gate
// (invariant #20), the audit identity (invariant #29) and the locking
// write all happen in the service — the client only supplies the verdict
// and optional notes.
export class RecordTestResultRequestDto {
  // STEP 1: result — the verdict. Restricting the vocabulary here (rather
  //         than accepting any boolean) keeps the future Notes copy and
  //         pipeline derivation unambiguous, and 400s a bogus value before
  //         the service is ever reached.
  @IsIn(TEST_RESULT_VALUES)
  result: TestResultValue;

  // STEP 2: notes — examiner's free text; explicitly optional.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}