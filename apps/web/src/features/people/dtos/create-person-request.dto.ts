// Frontend request DTO for POST /people (code-standards.md § 1 naming).
// Plain interface, shape only — validation lives on the backend DTO class
// (invariant #8), and the client's zod schema mirrors it as a UX shortcut
// (library-docs.md § 9), never as a security boundary.

import type { Gender } from "@repo/shared"

export interface CreatePersonRequestDto {
  nationalNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  address: string
  phone: string
  email: string
  countryName: string
  photoUrl?: string
}