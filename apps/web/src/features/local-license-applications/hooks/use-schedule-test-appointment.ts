"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { testingService } from "../services/testing.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"
import type { ScheduleTestAppointmentRequestDto } from "../dtos/schedule-test-appointment-request.dto"

export function useScheduleTestAppointment(localDrivingLicenseApplicationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: ScheduleTestAppointmentRequestDto) =>
      testingService.scheduleTestAppointment(localDrivingLicenseApplicationId, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.detail(localDrivingLicenseApplicationId),
      })
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.pipeline(localDrivingLicenseApplicationId),
      })
    },
  })
}