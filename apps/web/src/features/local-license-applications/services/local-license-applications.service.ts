import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type {
  ApplicationStatus,
  LicenseDto,
  LocalDrivingLicenseApplicationDto,
  PersonDto,
} from "@repo/shared"
import type { CreateLocalLicenseApplicationRequestDto } from "../create-local-license-application-request.dto"
import type { IssueLicenseRequestDto } from "../dtos/issue-license-request.dto"

export interface LocalLicenseApplicationListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: ApplicationStatus
}

const CITIZEN_OPTIONS_PAGE_SIZE = 1000

export const localLicenseApplicationsService = {
  async getLocalLicenseApplications(
    params: LocalLicenseApplicationListParams,
  ): Promise<{
    data: LocalDrivingLicenseApplicationDto[]
    meta: PaginatedApiResponse<LocalDrivingLicenseApplicationDto>["meta"]
  }> {
    const { data } = await apiClient.get<PaginatedApiResponse<LocalDrivingLicenseApplicationDto>>(
      "/local-license-applications",
      { params },
    )
    return { data: data.data, meta: data.meta }
  },

  async getLocalLicenseApplication(id: number): Promise<LocalDrivingLicenseApplicationDto> {
    const { data } = await apiClient.get<ApiResponse<LocalDrivingLicenseApplicationDto>>(
      `/local-license-applications/${id}`,
    )
    return data.data
  },

  async createLocalLicenseApplication(
    dto: CreateLocalLicenseApplicationRequestDto,
  ): Promise<LocalDrivingLicenseApplicationDto> {
    const { data } = await apiClient.post<ApiResponse<LocalDrivingLicenseApplicationDto>>(
      "/local-license-applications",
      dto,
    )
    return data.data
  },

  async cancelApplication(id: number): Promise<LocalDrivingLicenseApplicationDto> {
    const { data } = await apiClient.patch<ApiResponse<LocalDrivingLicenseApplicationDto>>(
      `/local-license-applications/${id}/cancel`,
    )
    return data.data
  },

  async issueLicense(id: number, dto: IssueLicenseRequestDto): Promise<LicenseDto> {
    const { data } = await apiClient.post<ApiResponse<LicenseDto>>(
      `/local-license-applications/${id}/issue-license`,
      dto,
    )
    return data.data
  },

  async getCitizenOptions(): Promise<PersonDto[]> {
    const { data } = await apiClient.get<PaginatedApiResponse<PersonDto>>("/people", {
      params: { page: 1, pageSize: CITIZEN_OPTIONS_PAGE_SIZE },
    })
    return data.data
  },
}