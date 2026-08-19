"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"
import type { UpdateUserPasswordRequestDto } from "../dtos/update-user-password-request.dto"

export function useUpdateUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateUserPasswordRequestDto }) =>
      userService.updatePassword(id, dto),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) })
    },
  })
}