"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableCombobox } from "@/shared/components/searchable-combobox"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { ApplicationType, type PersonDto } from "@repo/shared"
import { useLicenseClasses } from "@/features/lookup/hooks/use-license-classes"
import { useApplicationTypes } from "@/features/lookup/hooks/use-application-types"
import { useCitizenOptions } from "../../hooks/use-citizen-options"
import { useCreateLocalLicenseApplication } from "../../hooks/use-create-local-license-application"

const createLocalApplicationSchema = z.object({
  personId: z.number({ message: "Select a citizen" }).int().positive(),
  licenseClassId: z.number({ message: "Select a license class" }).int().positive(),
})

type NewLocalApplicationFormValues = z.infer<typeof createLocalApplicationSchema>

const NEW_DRIVING_LICENSE_FEE = ApplicationType.NEW_DRIVING_LICENSE

export function NewLocalApplicationModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const form = useForm<NewLocalApplicationFormValues>({
    resolver: zodResolver(createLocalApplicationSchema),
    defaultValues: { personId: undefined, licenseClassId: undefined },
  })

  const createApplication = useCreateLocalLicenseApplication()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const citizens = useCitizenOptions()
  const licenseClasses = useLicenseClasses()
  const applicationTypes = useApplicationTypes()

  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  const newLicenseFee = applicationTypes.data?.find(
    (type) => type.applicationTypeTitle === NEW_DRIVING_LICENSE_FEE,
  )?.applicationFees
  const feeText = newLicenseFee ? `Application fee: $${newLicenseFee}.` : "Application fee: —."

  const selectedCitizen =
    citizens.data?.find((citizen) => citizen.id === form.watch("personId")) ?? null

  const onSubmit = async (values: NewLocalApplicationFormValues) => {
    setSubmitError(null)
    try {
      await createApplication.mutateAsync(values)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not create the application. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">
            New Local Driving License Application
          </DialogTitle>
          <DialogDescription>{feeText} Minimum age is enforced per license class.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            <Controller
              control={form.control}
              name="personId"
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="applicant">Applicant</Label>
                  <SearchableCombobox<PersonDto>
                    id="applicant"
                    value={selectedCitizen}
                    onValueChange={(citizen) => field.onChange(citizen ? citizen.id : undefined)}
                    options={citizens.data}
                    isPending={citizens.isPending}
                    isError={citizens.isError}
                    onRetry={() => citizens.refetch()}
                    getOptionKey={(citizen) => citizen.id}
                    getOptionLabel={(citizen) => `${citizen.firstName} ${citizen.lastName}`}
                    getOptionSecondary={(citizen) => citizen.nationalNumber}
                    triggerPlaceholder="Select a citizen..."
                    searchPlaceholder="Search by name or national number"
                    loadingMessage="Loading citizens…"
                    errorMessage="Could not load citizens."
                    emptyMessage="No citizens registered yet"
                    noMatchMessage={(search) => `No citizens match "${search}"`}
                    invalid={!!fieldState.error}
                  />
                  {fieldState.error && (
                    <p className="text-xs font-medium text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="licenseClassId"
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="licenseClass">License Class</Label>
                  <Select
                    value={field.value !== undefined ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={licenseClasses.isPending}
                  >
                    <SelectTrigger
                      id="licenseClass"
                      className="h-10 w-full bg-card"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue
                        placeholder={
                          licenseClasses.isPending ? "Loading classes…" : "Select a license class"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(licenseClasses.data ?? []).map((licenseClass) => (
                        <SelectItem key={licenseClass.id} value={String(licenseClass.id)}>
                          {licenseClass.className} (Min age {licenseClass.minimumAllowedAge})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {licenseClasses.isError && (
                    <p className="text-xs font-medium text-destructive" role="alert">
                      Could not load license classes.{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs font-medium"
                        onClick={() => licenseClasses.refetch()}
                      >
                        Try again
                      </Button>
                    </p>
                  )}
                  {fieldState.error && (
                    <p className="text-xs font-medium text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
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
            <Button
              type="submit"
              className="h-10"
              disabled={createApplication.isPending || !licenseClasses.data}
            >
              {createApplication.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Creating…
                </>
              ) : (
                "Create Application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}