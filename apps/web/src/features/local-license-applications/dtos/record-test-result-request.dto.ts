export interface RecordTestResultRequestDto {
  result: "passed" | "failed"
  notes?: string
}