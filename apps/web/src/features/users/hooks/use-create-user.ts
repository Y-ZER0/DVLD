"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"
import type { CreateUserRequestDto } from "../dtos/create-user-request.dto"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateUserRequestDto) => userService.createUser(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.unlinkedPeople() })
    },
  })
}