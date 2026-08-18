// RecordTestResultRequestDto — frontend request shape for PATCH
// /test-appointments/:id/result (Feature 5.2). Plain interface only
// (invariant #8). result mirrors the backend's 'passed' | 'failed'
// vocabulary (5.1 DTO @IsIn), which the service maps to the boolean
// Tests.testResult column; notes is the examiner's free text, optional.

export interface RecordTestResultRequestDto {
  result: "passed" | "failed"
  notes?: string
}