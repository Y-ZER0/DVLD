export interface ReplaceLicenseRequestDto {
  reason: "damaged" | "lost"
  notes?: string
}