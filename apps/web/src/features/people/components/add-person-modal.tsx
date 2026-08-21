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
import { useQueryClient } from "@tanstack/react-query"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { useCreatePerson } from "../hooks/use-create-person"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"
import { PersonFormFields } from "./person-form-fields"
import { PersonPhotoField } from "./person-photo-field"
import type { PersonFormValues } from "./person-form-values"

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

interface AddPersonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPersonModal({ open, onOpenChange }: AddPersonModalProps) {
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
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  const initials = `${form.watch("firstName")?.charAt(0) ?? ""}${form.watch("lastName")?.charAt(0) ?? ""}`.toUpperCase()

  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
      setPhotoFile(null)
    }
  }, [open, form])

  const onSubmit = async (values: PersonFormValues) => {
    setSubmitError(null)
    try {
      const created = await createPerson.mutateAsync(values)
      if (photoFile) {
        setPhotoUploading(true)
        try {
          await personService.uploadPersonPhoto(created.id, photoFile)
          await queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
          await queryClient.invalidateQueries({ queryKey: peopleKeys.detail(created.id) })
        } finally {
          setPhotoUploading(false)
        }
      }
      onOpenChange(false)
      form.reset()
      setPhotoFile(null)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not add the person. Try again."))
      setPhotoUploading(false)
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
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-0"
        >
          <div className="px-6 py-4 space-y-4">
            <PersonPhotoField
              value={null}
              onFileSelect={setPhotoFile}
              onClearExisting={() => setPhotoFile(null)}
              disabled={createPerson.isPending || photoUploading}
              fallbackInitials={initials}
            />
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
            <Button type="submit" className="h-10" disabled={createPerson.isPending || photoUploading}>
              {createPerson.isPending || photoUploading ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  {photoUploading ? "Uploading…" : "Adding…"}
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