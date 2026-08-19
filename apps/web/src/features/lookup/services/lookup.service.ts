import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse } from "@/shared/types/api-response"
import type { ApplicationTypeDto, LicenseClassDto, TestTypeDto } from "@repo/shared"

export const lookupService = {
  async getLicenseClasses(): Promise<LicenseClassDto[]> {
    const { data } = await apiClient.get<ApiResponse<LicenseClassDto[]>>(
      "/lookup/license-classes",
    )
    return data.data
  },

  async getApplicationTypes(): Promise<ApplicationTypeDto[]> {
    const { data } = await apiClient.get<ApiResponse<ApplicationTypeDto[]>>(
      "/lookup/application-types",
    )
    return data.data
  },

  async getTestTypes(): Promise<TestTypeDto[]> {
    const { data } = await apiClient.get<ApiResponse<TestTypeDto[]>>("/lookup/test-types")
    return data.data
  },
}