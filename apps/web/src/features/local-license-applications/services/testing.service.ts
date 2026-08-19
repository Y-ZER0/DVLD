import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse } from "@/shared/types/api-response"
import type { TestAppointmentDto, TestPipelineDto } from "@repo/shared"
import type { ScheduleTestAppointmentRequestDto } from "../dtos/schedule-test-appointment-request.dto"
import type { RecordTestResultRequestDto } from "../dtos/record-test-result-request.dto"

export const testingService = {
  async getTestPipeline(id: number): Promise<TestPipelineDto> {
    const { data } = await apiClient.get<ApiResponse<TestPipelineDto>>(
      `/test-appointments/pipeline/${id}`,
    )
    return data.data
  },

  async scheduleTestAppointment(
    localDrivingLicenseApplicationId: number,
    dto: ScheduleTestAppointmentRequestDto,
  ): Promise<TestAppointmentDto> {
    const { data } = await apiClient.post<ApiResponse<TestAppointmentDto>>(
      `/test-appointments/${localDrivingLicenseApplicationId}`,
      dto,
    )
    return data.data
  },

  async recordTestResult(
    id: number,
    dto: RecordTestResultRequestDto,
  ): Promise<TestAppointmentDto> {
    const { data } = await apiClient.patch<ApiResponse<TestAppointmentDto>>(
      `/test-appointments/${id}/result`,
      dto,
    )
    return data.data
  },
}