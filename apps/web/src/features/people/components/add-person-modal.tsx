"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useState } from "react"
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
import { Gender } from "@repo/shared"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { useCreatePerson } from "../hooks/use-create-person"
import { PersonFormFields } from "./person-form-fields"
import type { PersonFormValues } from "./person-form-values"

// STEP 1: The zod schema is the single client-side validation definition —
//         it mirrors the backend CreatePersonRequestDto rules
//         (library-docs.md § 2) so malformed input fails before it ever
//         hits the API (fail fast, cheap check first, invariant #25
//         principle). Errors render from the resolver, never from
//         hand-written local state.
const createPersonSchema = z.object({
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

// AddPersonModal — the "Add New Person" registration dialog (spec 1.2):
// white card, 12px corners, title + subtitle, the ten-field grid from
// PersonFormFields, then a light footer strip with Cancel / Add Person.
// Submits through useCreatePerson; the server's 409 on a duplicate
// National Number is shown verbatim in the modal.

interface AddPersonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPersonModal({ open, onOpenChange }: AddPersonModalProps) {
  // STEP 2: RHF owns field state + errors; the resolver wires the schema.
  //         Add-form defaults: Female stays unset (user picks), every
  //         other field starts empty except Gender = Male and Country =
  //         United States (spec defaults).
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      nationalNumber: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: Gender.MALE,
      address: "",
      phone: "",
      email: "",
      countryName: "United States",
    },
  })

  const createPerson = useCreatePerson()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // STEP 3: The modal stays mounted while closed (open prop driven), so
  //         values would otherwise linger between opens — reset to the
  //         spec defaults every time it opens, and drop any stale error.
  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  // STEP 4: On submit, validated values map straight onto the request DTO;
  //         a server rejection (e.g. "National number already exists", 409)
  //         is extracted from the API envelope and shown inline.
  const onSubmit = async (values: PersonFormValues) => {
    setSubmitError(null)
    try {
      await createPerson.mutateAsync(values)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not add the person. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[550px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Add New Person</DialogTitle>
          <DialogDescription>
            Register a new citizen in the national registry.
          </DialogDescription>
        </DialogHeader>

        <form
          // STEP 4: FormModal pattern — description under the title, the
          //         field grid, then the right-aligned footer bar. The
          //         form element wraps grid + footer so Enter submits.
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-0"
        >
          <div className="px-6 py-4">
            <PersonFormFields form={form} />
          </div>

          {/* STEP 5: Server-side failure (duplicate National No., 409)
                   surfaces in the same alert style as the sign-in form. */}
          {submitError && (
            <div
              role="alert"
              className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{submitError}</span>
            </div>
          )}

          <DialogFooter className="border-t bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 bg-card"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10" disabled={createPerson.isPending}>
              {createPerson.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Adding…
                </>
              ) : (
                "Add Person"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}