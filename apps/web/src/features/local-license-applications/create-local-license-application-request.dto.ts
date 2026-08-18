// CreateLocalLicenseApplicationRequestDto — the file-a-new-application
// request contract (build-plan.md § 4.1), mirroring the backend
// CreateLocalLicenseApplicationRequestDto exactly: only the citizen
// (personId) and the requested license class (licenseClassId) travel to
// the API. Everything else — fee snapshot (invariant #28), age gate,
// CreatedByUserID from the session (invariant #29), InitialStatus = New —
// is derived server-side, so the client must never send it.

export interface CreateLocalLicenseApplicationRequestDto {
  personId: number
  licenseClassId: number
}