import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type { PersonDto } from "@repo/shared"
import type { CreatePersonRequestDto } from "../dtos/create-person-request.dto"
import type { UpdatePersonRequestDto } from "../dtos/update-person-request.dto"

export interface PersonListParams {
  page?: number
  pageSize?: number
  search?: string
}

export const personService = {
  async getPeople(
    params: PersonListParams,
  ): Promise<{ data: PersonDto[]; meta: PaginatedApiResponse<PersonDto>["meta"] }> {
    const { data } = await apiClient.get<PaginatedApiResponse<PersonDto>>("/people", { params })
    return { data: data.data, meta: data.meta }
  },

  async getPerson(id: number): Promise<PersonDto> {
    const { data } = await apiClient.get<ApiResponse<PersonDto>>(`/people/${id}`)
    return data.data
  },

  async createPerson(dto: CreatePersonRequestDto): Promise<PersonDto> {
    const { data } = await apiClient.post<ApiResponse<PersonDto>>("/people", dto)
    return data.data
  },

  async updatePerson(id: number, dto: UpdatePersonRequestDto): Promise<PersonDto> {
    const { data } = await apiClient.patch<ApiResponse<PersonDto>>(`/people/${id}`, dto)
    return data.data
  },

  async deletePerson(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/people/${id}`)
  },
}