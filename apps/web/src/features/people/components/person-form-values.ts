// PersonFormValues — the field shape shared by the Add and Edit Person
// forms (identical field set; the two zod schemas live with their own
// modal, library-docs.md § 9). On submit, values map straight onto the
// backend request DTOs.

import type { Gender } from "@repo/shared"

export interface PersonFormValues {
  nationalNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  address: string
  phone: string
  email: string
  countryName: string
}