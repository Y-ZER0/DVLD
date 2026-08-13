// Frontend request DTO for PATCH /users/:id/password (invariant #8 —
// shape only). Mirrors UpdateUserPasswordRequestDto: a single new password,
// 8-72 chars, no old-password step (the clerk acts on the account holder's
// behalf, per the 2.2 UpdatePasswordModal).

export interface UpdateUserPasswordRequestDto {
  password: string
}