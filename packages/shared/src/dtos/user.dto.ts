// User contracts — system login accounts projected to the client
// (architecture.md § schema, invariant #9: defined here and nowhere else).
// Flat by design: the linked People row's display fields are denormalized
// into the DTO because the Users screens render those fields directly and
// never need the full Person. The password hash never appears in any
// response shape (invariant #15) — no password field exists here at all.

// A single user account row as the API returns it. personName is the
// linked citizen's "FirstName LastName"; nationalNumber their registry id.
export interface UserDto {
  id: number;
  username: string;
  personId: number;
  personName: string;
  nationalNumber: string;
  isActive: boolean;
}
