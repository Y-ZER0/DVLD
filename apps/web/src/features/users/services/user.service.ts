import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type { PersonDto, UserDto } from "@repo/shared"
import type { CreateUserRequestDto } from "../create-user-request.dto"
import type { UpdateUserPasswordRequestDto } from "../update-user-password-request.dto"

// userService — the users feature's service layer (invariant #4: the ONLY
// files allowed to touch apiClient for this feature). Pure, stateless async
// functions (invariant #7), one per 2.1 endpoint. getUnlinkedPeople hits a
// people-domain route (GET /people/unlinked) because the Pick-a-Person
// combobox feed lives there on the backend (build-plan.md § 2.1) — the
// frontend feature boundary is preserved (invariant #13), the backend
// module boundary is the backend's own concern.

export interface UserListParams {
  page?: number
  pageSize?: number
  search?: string
}

export const userService = {
  // GET /users — paginated, search-filterable account list (username,
  // linked person's name, national number — newest first).
  async getUsers(
    params: UserListParams,
  ): Promise<{ data: UserDto[]; meta: PaginatedApiResponse<UserDto>["meta"] }> {
    const { data } = await apiClient.get<PaginatedApiResponse<UserDto>>("/users", { params })
    return { data: data.data, meta: data.meta }
  },

  // GET /people/unlinked — every citizen with no account yet; plain array
  // feed for the "Link to Person" combobox (the combobox type-to-filters
  // over the full set client-side).
  async getUnlinkedPeople(): Promise<PersonDto[]> {
    const { data } = await apiClient.get<ApiResponse<PersonDto[]>>("/people/unlinked")
    return data.data
  },

  // POST /users — links an unlinked person to a new account. The backend
  // 409s when the person already has an account or the username is taken.
  async createUser(dto: CreateUserRequestDto): Promise<UserDto> {
    const { data } = await apiClient.post<ApiResponse<UserDto>>("/users", dto)
    return data.data
  },

  // PATCH /users/:id/password — replaces the account's password (8-72
  // chars, re-hashed with bcrypt cost 12 server-side).
  async updatePassword(id: number, dto: UpdateUserPasswordRequestDto): Promise<UserDto> {
    const { data } = await apiClient.patch<ApiResponse<UserDto>>(`/users/${id}/password`, dto)
    return data.data
  },

  // PATCH /users/:id/status — toggles IsActive. JwtStrategy re-checks
  // IsActive per request, so a deactivation takes effect at the next
  // request, not at token expiry.
  async setStatus(id: number, isActive: boolean): Promise<UserDto> {
    const { data } = await apiClient.patch<ApiResponse<UserDto>>(`/users/${id}/status`, {
      isActive,
    })
    return data.data
  },

  // DELETE /users/:id — hard delete. The backend 409s when the account is
  // referenced by other records (Applications, Drivers, etc.) — the UI
  // surfaces that message verbatim and keeps the row.
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/users/${id}`)
  },
}