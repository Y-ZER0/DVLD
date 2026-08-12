// Auth contracts — the only place these response shapes are defined
// (architecture.md § Authentication & Core Patterns, invariant #9).
// There is deliberately no role/permission field anywhere (invariant #31).

// The authenticated identity projected to the client. fullName is derived
// from the linked People row (FirstName + LastName) — a Users row never
// exists without a citizen behind it.
export interface AuthUserDto {
  id: number;
  username: string;
  personId: number;
  fullName: string;
}

// Payload of a successful login: the bearer token plus the minimal user
// shape the client needs to render the session (avatar badge, etc.).
export interface AuthDto {
  token: string;
  user: AuthUserDto;
}

// Frontend request shape for POST /api/auth/login (plain interface — the
// backend validates with its own class-validator DTO, invariant #8/#10).
export interface LoginRequestDto {
  username: string;
  password: string;
}