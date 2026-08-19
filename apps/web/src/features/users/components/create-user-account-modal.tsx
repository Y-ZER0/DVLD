"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleAlert, LoaderCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableCombobox } from "@/shared/components/searchable-combobox"
import { PasswordInput } from "@/shared/components/password-input"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import type { PersonDto } from "@repo/shared"
import { useUnlinkedPeople } from "../hooks/use-unlinked-people"
import { useCreateUser } from "../hooks/use-create-user"

const createUserSchema = z.object({
  personId: z
    .number({ message: "Select a person to link" })
    .int()
    .positive(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username may only contain letters, numbers, dots, dashes and underscores",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

interface CreateUserAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserAccountModal({ open, onOpenChange }: CreateUserAccountModalProps) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { personId: undefined, username: "", password: "" },
  })

  const createUser = useCreateUser()
  const unlinkedPeople = useUnlinkedPeople()
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  const selectedPerson =
    unlinkedPeople.data?.find((person) => person.id === form.watch("personId")) ?? null

  const onSubmit = async (values: CreateUserFormValues) => {
    setSubmitError(null)
    try {
      await createUser.mutateAsync(values)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not create the user account. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Create User Account</DialogTitle>
          <DialogDescription>Link a system account to a registered citizen.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="personId">Link to Person</Label>
              <SearchableCombobox
                id="personId"
                value={selectedPerson}
                onValueChange={(person) => {
                  if (person) form.setValue("personId", person.id)
                }}
                options={unlinkedPeople.data}
                isPending={unlinkedPeople.isPending}
                isError={unlinkedPeople.isError}
                onRetry={() => unlinkedPeople.refetch()}
                getOptionKey={(person) => person.id}
                getOptionLabel={(person) => `${person.firstName} ${person.lastName}`}
                getOptionSecondary={(person) => person.nationalNumber}
                triggerPlaceholder="Select an unlinked citizen"
                searchPlaceholder="Search by name or national number"
                loadingMessage="Loading citizens…"
                errorMessage="Could not load citizens."
                emptyMessage="No citizens available to link"
                noMatchMessage={(search) => `No unlinked citizens match "${search}"`}
                invalid={!!form.formState.errors.personId}
              />
              {form.formState.errors.personId && (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {form.formState.errors.personId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                className="h-10"
                placeholder="john.doe"
                autoComplete="off"
                aria-invalid={!!form.formState.errors.username}
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{submitError}</span>
            </div>
          )}

          <DialogFooter className="gap-3 border-t bg-background px-6 pt-5 pb-6">
            <Button
              type="button"
              variant="outline"
              className="h-10 bg-card"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10" disabled={createUser.isPending}>
              {createUser.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Creating…
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}