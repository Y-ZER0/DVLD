import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse } from "@/shared/types/api-response"
import type { ApplicationTypeDto, LicenseClassDto, TestTypeDto } from "@repo/shared"
import type { UpdateApplicationTypeRequestDto } from "../dtos/update-application-type-request.dto"
import type { UpdateLicenseClassRequestDto } from "../dtos/update-license-class-request.dto"
import type { UpdateTestTypeRequestDto } from "../dtos/update-test-type-request.dto"

export const configurationService = {
  async updateLicenseClass(id: number, dto: UpdateLicenseClassRequestDto): Promise<LicenseClassDto> {
    const { data } = await apiClient.patch<ApiResponse<LicenseClassDto>>(
      `/lookup/license-classes/${id}`,
      dto,
    )
    return data.data
  },

  async updateApplicationType(
    id: number,
    dto: UpdateApplicationTypeRequestDto,
  ): Promise<ApplicationTypeDto> {
    const { data } = await apiClient.patch<ApiResponse<ApplicationTypeDto>>(
      `/lookup/application-types/${id}`,
      dto,
    )
    return data.data
  },

  async updateTestType(id: number, dto: UpdateTestTypeRequestDto): Promise<TestTypeDto> {
    const { data } = await apiClient.patch<ApiResponse<TestTypeDto>>(
      `/lookup/test-types/${id}`,
      dto,
    )
    return data.data
  },
}
