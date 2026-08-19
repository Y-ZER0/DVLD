// IssueLicenseRequestDto — frontend request shape for POST
// /local-license-applications/:id/issue-license (Feature 6.2). Plain
// interface only (invariant #8). Mirrors the backend 6.1
// IssueLicenseRequestDto class (notes optional, MaxLength 500) — the
// modal's colocated zod schema applies the same cap so a malformed
// submit is rejected before it hits the API.

export interface IssueLicenseRequestDto {
  notes?: string
}