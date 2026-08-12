import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse } from "@/shared/types/api-response"
import type { AuthDto, LoginRequestDto } from "@repo/shared"

// authService — the auth feature's frontend service layer (invariant #4:
// the ONLY files allowed to touch apiClient for this feature). Pure,
// stateless async functions; the session produced here is stored by the
// caller (useLogin → useAuthStore), never held in the service.
export const authService = {
  // Calls POST /api/auth/login and returns the session payload (token +
  // user). This is a public endpoint — no token is attached to the request,
  // and the 401 interceptor must NOT redirect for it (api-client.ts).
  async login(dto: LoginRequestDto): Promise<AuthDto> {
    const { data } = await apiClient.post<ApiResponse<AuthDto>>("/auth/login", dto)
    return data.data
  },
}