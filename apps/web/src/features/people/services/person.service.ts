import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type { PersonDto } from "@repo/shared"
import type { CreatePersonRequestDto } from "../dtos/create-person-request.dto"
import type { UpdatePersonRequestDto } from "../dtos/update-person-request.dto"

// personService — the people feature's service layer (invariant #4: the
// ONLY files allowed to touch apiClient for this feature). Pure, stateless
// async functions (invariant #7); the paginated list returns the server's
// meta alongside the rows so the table renders "X records · Page Y of Z"
// from server truth, never from client-side card-counting.

export interface PersonListParams {
  page?: number
  pageSize?: number
  search?: string
}

export const personService = {
  // GET /people — paginated, search-filterable citizen list (newest first).
  async getPeople(
    params: PersonListParams,
  ): Promise<{ data: PersonDto[]; meta: PaginatedApiResponse<PersonDto>["meta"] }> {
    const { data } = await apiClient.get<PaginatedApiResponse<PersonDto>>("/people", { params })
    return { data: data.data, meta: data.meta }
  },

  // GET /people/:id — a single citizen record.
  async getPerson(id: number): Promise<PersonDto> {
    const { data } = await apiClient.get<ApiResponse<PersonDto>>(`/people/${id}`)
    return data.data
  },

  // POST /people — registers a new citizen (409 on duplicate National No.).
  async createPerson(dto: CreatePersonRequestDto): Promise<PersonDto> {
    const { data } = await apiClient.post<ApiResponse<PersonDto>>("/people", dto)
    return data.data
  },

  // PATCH /people/:id — true partial update; only present fields are sent.
  async updatePerson(id: number, dto: UpdatePersonRequestDto): Promise<PersonDto> {
    const { data } = await apiClient.patch<ApiResponse<PersonDto>>(`/people/${id}`, dto)
    return data.data
  },

  // DELETE /people/:id — hard delete; the backend answers 409 when linked
  // records (a User, later Drivers) exist, which the UI surfaces verbatim.
  async deletePerson(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/people/${id}`)
  },
}