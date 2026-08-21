"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { lookupKeys } from "@/features/lookup/lookupKeys"
import { configurationService } from "../services/configuration.service"
import type { UpdateTestTypeRequestDto } from "../dtos/update-test-type-request.dto"

export function useUpdateTestType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateTestTypeRequestDto }) =>
      configurationService.updateTestType(id, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.testTypes() })
    },
  })
}
