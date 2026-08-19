import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type { InternationalEligibleDriverDto, InternationalLicenseDto } from "@repo/shared"
import type { IssueInternationalLicenseRequestDto } from "../dtos/issue-international-license-request.dto"

export interface InternationalLicensesParams {
  page?: number
  pageSize?: number
}

const ELIGIBLE_DRIVERS_PAGE_SIZE = 1000

export const internationalLicensesService = {
  async getInternationalLicenses(
    params: InternationalLicensesParams,
  ): Promise<{
    data: InternationalLicenseDto[]
    meta: PaginatedApiResponse<InternationalLicenseDto>["meta"]
  }> {
    const { data } = await apiClient.get<PaginatedApiResponse<InternationalLicenseDto>>(
      "/international-licenses",
      { params },
    )
    return { data: data.data, meta: data.meta }
  },

  async getEligibleDrivers(): Promise<InternationalEligibleDriverDto[]> {
    const { data } = await apiClient.get<
      PaginatedApiResponse<InternationalEligibleDriverDto>
    >("/drivers/eligible-for-international", {
      params: { page: 1, pageSize: ELIGIBLE_DRIVERS_PAGE_SIZE },
    })
    return data.data
  },

  async issueInternationalLicense(
    dto: IssueInternationalLicenseRequestDto,
  ): Promise<InternationalLicenseDto> {
    const { data } = await apiClient.post<ApiResponse<InternationalLicenseDto>>(
      "/international-licenses",
      dto,
    )
    return data.data
  },
}