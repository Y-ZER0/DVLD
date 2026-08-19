"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) })
    },
  })
}