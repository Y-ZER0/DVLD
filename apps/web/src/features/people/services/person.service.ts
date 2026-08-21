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

  async uploadTempPhoto(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<ApiResponse<{ url: string }>>('/people/photo-upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data.url
  },

  async uploadPersonPhoto(id: number, file: File): Promise<PersonDto> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<ApiResponse<PersonDto>>(`/people/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  async removePersonPhoto(id: number): Promise<PersonDto> {
    const { data } = await apiClient.delete<ApiResponse<PersonDto>>(`/people/${id}/photo`)
    return data.data
  },
}