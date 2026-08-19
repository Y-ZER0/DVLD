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