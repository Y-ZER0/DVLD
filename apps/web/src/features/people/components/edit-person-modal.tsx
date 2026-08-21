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
import { Gender, type PersonDto } from "@repo/shared"
import { useQueryClient } from "@tanstack/react-query"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { usePerson } from "../hooks/use-person"
import { useUpdatePerson } from "../hooks/use-update-person"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"
import { PersonFormFields } from "./person-form-fields"
import { PersonPhotoField } from "./person-photo-field"
import type { PersonFormValues } from "./person-form-values"

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

interface EditPersonModalProps {
  person: PersonDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPersonModal({ person, open, onOpenChange }: EditPersonModalProps) {
  const { data: personData } = usePerson(person.id, person)

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
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)

  const currentPhoto = photoRemoved ? null : (personData?.photoUrl ?? person.photoUrl ?? null)
  const initials = `${form.watch("firstName")?.charAt(0) ?? person.firstName.charAt(0) ?? ""}${form.watch("lastName")?.charAt(0) ?? person.lastName.charAt(0) ?? ""}`.toUpperCase()

  useEffect(() => {
    if (open) {
      setPhotoFile(null)
      setPhotoRemoved(false)
      setSubmitError(null)
    }
  }, [open])

  const onSubmit = async (values: PersonFormValues) => {
    setSubmitError(null)
    try {
      await updatePerson.mutateAsync({ id: person.id, dto: values })
      if (photoFile) {
        setPhotoBusy(true)
        try {
          await personService.uploadPersonPhoto(person.id, photoFile)
          await queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
          await queryClient.invalidateQueries({ queryKey: peopleKeys.detail(person.id) })
        } finally {
          setPhotoBusy(false)
        }
      } else if (photoRemoved) {
        setPhotoBusy(true)
        try {
          await personService.removePersonPhoto(person.id)
          await queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
          await queryClient.invalidateQueries({ queryKey: peopleKeys.detail(person.id) })
        } finally {
          setPhotoBusy(false)
        }
      }
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not save the changes. Try again."))
      setPhotoBusy(false)
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
          <div className="px-6 py-4 space-y-4">
            <PersonPhotoField
              value={currentPhoto}
              onFileSelect={(file) => {
                setPhotoFile(file)
                if (file) setPhotoRemoved(false)
              }}
              onClearExisting={() => {
                setPhotoRemoved(true)
                setPhotoFile(null)
              }}
              disabled={updatePerson.isPending || photoBusy}
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
            <Button type="submit" className="h-10" disabled={updatePerson.isPending || photoBusy}>
              {updatePerson.isPending || photoBusy ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  {photoBusy ? "Uploading…" : "Saving…"}
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