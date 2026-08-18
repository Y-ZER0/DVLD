// Frontend request DTO for POST /users (invariant #8: plain interface,
// shape only — validation is the backend's job via class-validator). Rules
// mirror the backend CreateUserRequestDto exactly: personId of an existing
// unlinked person, username restricted to [a-zA-Z0-9._-], password 8-72
// chars (bcrypt's byte cap). The zod schema in CreateUserAccountModal
// applies the same rules client-side as a UX shortcut only.

export interface CreateUserRequestDto {
  personId: number
  username: string
  password: string
}