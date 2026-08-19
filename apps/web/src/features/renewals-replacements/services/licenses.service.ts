import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type { LicenseDto, LicenseRegisterRowDto } from "@repo/shared"
import type { RenewLicenseRequestDto } from "../dtos/renew-license-request.dto"
import type { ReplaceLicenseRequestDto } from "../dtos/replace-license-request.dto"

export interface LicenseRegisterParams {
  page?: number
  pageSize?: number
}

export const licensesService = {
  async getLicenseRegister(
    params: LicenseRegisterParams,
  ): Promise<{
    data: LicenseRegisterRowDto[]
    meta: PaginatedApiResponse<LicenseRegisterRowDto>["meta"]
  }> {
    const { data } = await apiClient.get<PaginatedApiResponse<LicenseRegisterRowDto>>(
      "/licenses/register",
      { params },
    )
    return { data: data.data, meta: data.meta }
  },

  async renewLicense(licenseId: number, dto: RenewLicenseRequestDto): Promise<LicenseDto> {
    const { data } = await apiClient.post<ApiResponse<LicenseDto>>(
      `/licenses/${licenseId}/renew`,
      dto,
    )
    return data.data
  },

  async replaceLicense(
    licenseId: number,
    dto: ReplaceLicenseRequestDto,
  ): Promise<LicenseDto> {
    const { data } = await apiClient.post<ApiResponse<LicenseDto>>(
      `/licenses/${licenseId}/replace`,
      dto,
    )
    return data.data
  },
}