// LicenseClass contracts — the LicenseClasses lookup table projected to the
// client (architecture.md § schema, invariant #9: defined here and nowhere
// else). Fees stay strings: the numeric/decimal column arrives as a string
// over JSON, and the client only ever displays/compares these values — all
// fee math happens server-side at transaction time (invariant #28).

// A single license class row as the API returns it. classFees is the
// current configuration fee (e.g. "35.00") — never a snapshotted PaidFees.
export interface LicenseClassDto {
  id: number;
  className: string;
  minimumAllowedAge: number;
  defaultValidityLength: number;
  classFees: string;
}