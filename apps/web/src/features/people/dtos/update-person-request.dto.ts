import type { CreatePersonRequestDto } from "../dtos/create-person-request.dto"

export type UpdatePersonRequestDto = Partial<CreatePersonRequestDto> & {
  photoUrl?: string | null
}