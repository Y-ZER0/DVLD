import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type { DetentionRegisterRowDto, EligibleLicenseForDetentionDto } from "@repo/shared"
import type { DetainLicenseRequestDto } from "../dtos/detain-license-request.dto"

export interface DetentionRegisterParams {
  page?: number
  pageSize?: number
}

const ELIGIBLE_LICENSES_PAGE_SIZE = 1000

export const detainReleaseService = {
  async getEligibleLicenses(): Promise<EligibleLicenseForDetentionDto[]> {
    const { data } = await apiClient.get<PaginatedApiResponse<EligibleLicenseForDetentionDto>>(
      "/detain-release/active-licenses",
      { params: { page: 1, pageSize: ELIGIBLE_LICENSES_PAGE_SIZE } },
    )
    return data.data
  },

  async getDetentionRegister(params: DetentionRegisterParams): Promise<{
    data: DetentionRegisterRowDto[]
    meta: PaginatedApiResponse<DetentionRegisterRowDto>["meta"]
  }> {
    const { data } = await apiClient.get<PaginatedApiResponse<DetentionRegisterRowDto>>(
      "/detain-release/register",
      { params },
    )
    return { data: data.data, meta: data.meta }
  },

  async detainLicense(dto: DetainLicenseRequestDto): Promise<DetentionRegisterRowDto> {
    const { data } = await apiClient.post<ApiResponse<DetentionRegisterRowDto>>(
      "/detain-release/detain",
      dto,
    )
    return data.data
  },

  async releaseLicense(detainId: number): Promise<DetentionRegisterRowDto> {
    const { data } = await apiClient.post<ApiResponse<DetentionRegisterRowDto>>(
      `/detain-release/${detainId}/release`,
    )
    return data.data
  },
}