import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse, PaginatedApiResponse } from "@/shared/types/api-response"
import type {
  DriverDirectoryRowDto,
  DriverSummaryDto,
  DriverTestLogEntryDto,
  InternationalLicenseDto,
  LicenseRegisterRowDto,
} from "@repo/shared"

export interface DriversDirectoryParams {
  page?: number
  pageSize?: number
}

export interface DriversSearchParams {
  search: string
  page?: number
  pageSize?: number
}

export const driversService = {
  async getDrivers(
    params: DriversDirectoryParams,
  ): Promise<{ data: DriverDirectoryRowDto[]; meta: PaginatedApiResponse<DriverDirectoryRowDto>["meta"] }> {
    const { data } = await apiClient.get<PaginatedApiResponse<DriverDirectoryRowDto>>("/drivers", {
      params,
    })
    return { data: data.data, meta: data.meta }
  },

  async searchDrivers(
    params: DriversSearchParams,
  ): Promise<{ data: DriverDirectoryRowDto[]; meta: PaginatedApiResponse<DriverDirectoryRowDto>["meta"] }> {
    const { data } = await apiClient.get<PaginatedApiResponse<DriverDirectoryRowDto>>("/drivers/search", {
      params,
    })
    return { data: data.data, meta: data.meta }
  },

  async getDriverSummary(id: number): Promise<DriverSummaryDto> {
    const { data } = await apiClient.get<ApiResponse<DriverSummaryDto>>(`/drivers/${id}/summary`)
    return data.data
  },

  async getDriverLocalLicenses(id: number): Promise<LicenseRegisterRowDto[]> {
    const { data } = await apiClient.get<ApiResponse<LicenseRegisterRowDto[]>>(
      `/drivers/${id}/local-licenses`,
    )
    return data.data
  },

  async getDriverInternationalLicenses(id: number): Promise<InternationalLicenseDto[]> {
    const { data } = await apiClient.get<ApiResponse<InternationalLicenseDto[]>>(
      `/drivers/${id}/international-licenses`,
    )
    return data.data
  },

  async getDriverTestLog(id: number): Promise<DriverTestLogEntryDto[]> {
    const { data } = await apiClient.get<ApiResponse<DriverTestLogEntryDto[]>>(
      `/drivers/${id}/test-log`,
    )
    return data.data
  },
}
