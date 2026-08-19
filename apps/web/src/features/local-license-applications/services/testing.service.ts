import { apiClient } from "@/shared/lib/api-client"
import type { ApiResponse } from "@/shared/types/api-response"
import type { TestAppointmentDto, TestPipelineDto } from "@repo/shared"
import type { ScheduleTestAppointmentRequestDto } from "../dtos/schedule-test-appointment-request.dto"
import type { RecordTestResultRequestDto } from "../dtos/record-test-result-request.dto"

// testingService — the 5.2 test-pipeline HTTP surface. It calls routes
// owned by the backend `testing` module (/test-appointments/*), but the
// frontend feature that owns the pipeline UI is local-license-applications
// (architecture.md § features: "includes the test pipeline + issue-license
// UI") — so these methods live here, the same cross-route precedent as
// getCitizenOptions on /people and userService.getUnlinkedPeople
// (invariant #13: another feature's route is fine, the import boundary is
// what matters). Pure, stateless async functions (invariant #7), one per
// 5.1 endpoint.

export const testingService = {
  // GET /test-appointments/pipeline/:id — the detail page's right-hand
  // column: three ordered stages + full appointment history (5.1 contract,
  // TestPipelineDto).
  async getTestPipeline(id: number): Promise<TestPipelineDto> {
    const { data } = await apiClient.get<ApiResponse<TestPipelineDto>>(
      `/test-appointments/pipeline/${id}`,
    )
    return data.data
  },

  // POST /test-appointments/:id — books a slot for one stage of an
  // application. The backend 409s on a double-booking, a non-New
  // application, or a stage whose predecessor hasn't Passed (invariant
  // #19) — surfaced verbatim by the schedule modal.
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

  // PATCH /test-appointments/:id/result — records the Pass/Fail verdict
  // and permanently locks the appointment (invariants #20/#21). The
  // backend 409s on an already-locked or non-New application — surfaced
  // verbatim by the record-result modal, which stays open.
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