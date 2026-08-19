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