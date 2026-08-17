"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
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
import { Gender, type PersonDto } from "@repo/shared"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { usePerson } from "../hooks/use-person"
import { useUpdatePerson } from "../hooks/use-update-person"
import { PersonFormFields } from "./person-form-fields"
import type { PersonFormValues } from "./person-form-values"

// STEP 1: Update schema — mirrors the backend UpdatePersonRequestDto's
//         field rules. Every field is required HERE because the Edit form
//         always carries the full record (pre-populated, all-or-nothing);
//         the backend still treats a sparse body as a valid partial PATCH.
const updatePersonSchema = z.object({
  nationalNumber: z
    .string()
    .trim()
    .min(1, "National Number is required")
    .regex(/^N-\d{8}$/, "National Number must match N-########"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date"),
  gender: z.nativeEnum(Gender),
  address: z.string().trim().min(1, "Address is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  countryName: z.string().trim().min(1, "Country is required"),
})

// EditPersonModal — the "Edit Person" dialog (spec 1.2): same card
// structure as Add, with every field pre-populated from the row the table
// already fetched. Seeds the form instantly from the row, then refetches
// the record server-side in the background for freshness. Saves via
// useUpdatePerson; the server's errors (e.g. 409 duplicate National No.)
// are shown inline.

interface EditPersonModalProps {
  person: PersonDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPersonModal({ person, open, onOpenChange }: EditPersonModalProps) {
  // STEP 2: Seed the detail cache with the row we already have so the
  //         dialog opens pre-populated with zero loading state; the query
  //         still runs in the background for server freshness.
  const { data: personData } = usePerson(person.id, person)

  // STEP 3: defaultValues are read ONCE at mount — the modal remounts per
  //         row (it is conditionally rendered), so values always belong to
  //         the person it was opened for.
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(updatePersonSchema),
    defaultValues: {
      nationalNumber: personData?.nationalNumber ?? "",
      firstName: personData?.firstName ?? "",
      lastName: personData?.lastName ?? "",
      dateOfBirth: personData?.dateOfBirth ?? "",
      gender: personData?.gender ?? Gender.MALE,
      address: personData?.address ?? "",
      phone: personData?.phone ?? "",
      email: personData?.email ?? "",
      countryName: personData?.countryName ?? "",
    },
  })

  const updatePerson = useUpdatePerson()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // STEP 4: Submit the full form as a PATCH; a rejection (e.g. the 409
  //         self-exempt duplicate check tripping on a stale value) is
  //         extracted from the API envelope and shown inline.
  const onSubmit = async (values: PersonFormValues) => {
    setSubmitError(null)
    try {
      await updatePerson.mutateAsync({ id: person.id, dto: values })
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not save the changes. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Edit Person</DialogTitle>
          <DialogDescription>Update the citizen record details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="px-6 py-4">
            <PersonFormFields form={form} />
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
            <Button type="submit" className="h-10" disabled={updatePerson.isPending}>
              {updatePerson.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}