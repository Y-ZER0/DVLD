"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { testingService } from "../services/testing.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"
import type { ScheduleTestAppointmentRequestDto } from "../dtos/schedule-test-appointment-request.dto"

// useScheduleTestAppointment — books a slot for one stage of an
// application (POST /test-appointments/:id, 5.1). On success the stage's
// status flips to 'Scheduled' (server-computed), so the application's
// pipeline AND detail queries are now stale — both invalidate (invariant
// #6). Server rejections (409 double-booking / non-New application /
// predecessor gate invariant #19) surface verbatim in the schedule modal,
// which stays open.

export function useScheduleTestAppointment(localDrivingLicenseApplicationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service — hooks never
    //         touch apiClient directly (invariant #4).
    mutationFn: (dto: ScheduleTestAppointmentRequestDto) =>
      testingService.scheduleTestAppointment(localDrivingLicenseApplicationId, dto),

    onSuccess: () => {
      // STEP 2: The stage transitions Schedule → Scheduled on the server;
      //         invalidate rather than patch so status, date, and the fee
      //         snapshot all re-read server truth.
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.detail(localDrivingLicenseApplicationId),
      })
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.pipeline(localDrivingLicenseApplicationId),
      })
    },
  })
}