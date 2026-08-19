import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type { PersonDto, UserDto } from "@repo/shared"
import type { CreateUserRequestDto } from "../dtos/create-user-request.dto"
import type { UpdateUserPasswordRequestDto } from "../dtos/update-user-password-request.dto"

export interface UserListParams {
  page?: number
  pageSize?: number
  search?: string
}

export const userService = {
  async getUsers(
    params: UserListParams,
  ): Promise<{ data: UserDto[]; meta: PaginatedApiResponse<UserDto>["meta"] }> {
    const { data } = await apiClient.get<PaginatedApiResponse<UserDto>>("/users", { params })
    return { data: data.data, meta: data.meta }
  },

  async getUnlinkedPeople(): Promise<PersonDto[]> {
    const { data } = await apiClient.get<ApiResponse<PersonDto[]>>("/people/unlinked")
    return data.data
  },

  async createUser(dto: CreateUserRequestDto): Promise<UserDto> {
    const { data } = await apiClient.post<ApiResponse<UserDto>>("/users", dto)
    return data.data
  },

  async updatePassword(id: number, dto: UpdateUserPasswordRequestDto): Promise<UserDto> {
    const { data } = await apiClient.patch<ApiResponse<UserDto>>(`/users/${id}/password`, dto)
    return data.data
  },

  async setStatus(id: number, isActive: boolean): Promise<UserDto> {
    const { data } = await apiClient.patch<ApiResponse<UserDto>>(`/users/${id}/status`, {
      isActive,
    })
    return data.data
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/users/${id}`)
  },
}