import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse } from "@/shared/types/api-response"
import type { AuthDto, LoginRequestDto } from "@repo/shared"

export const authService = {
  async login(dto: LoginRequestDto): Promise<AuthDto> {
    const { data } = await apiClient.post<ApiResponse<AuthDto>>("/auth/login", dto)
    return data.data
  },
}