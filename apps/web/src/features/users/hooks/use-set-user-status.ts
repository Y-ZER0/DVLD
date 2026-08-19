"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"

export function useSetUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      userService.setStatus(id, isActive),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) })
    },
  })
}