"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { testingService } from "../services/testing.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"
import type { RecordTestResultRequestDto } from "../dtos/record-test-result-request.dto"

export function useRecordTestResult(localDrivingLicenseApplicationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      appointmentId,
      dto,
    }: {
      appointmentId: number
      dto: RecordTestResultRequestDto
    }) => testingService.recordTestResult(appointmentId, dto),

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