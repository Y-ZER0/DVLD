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
import { useCitizenOptions } from "../hooks/use-citizen-options"
import { useCreateLocalLicenseApplication } from "../hooks/use-create-local-license-application"

// STEP 1: The zod schema is the single client-side validation definition —
//         it mirrors the backend CreateLocalLicenseApplicationRequestDto
//         (personId, licenseClassId; everything else is derived
//         server-side, invariants #28/#29) so malformed input fails before
//         it ever hits the API. Both ids are validated as positive ints
//         because the pickers only ever offer real records.
const createLocalApplicationSchema = z.object({
  personId: z.number({ message: "Select a citizen" }).int().positive(),
  licenseClassId: z.number({ message: "Select a license class" }).int().positive(),
})

type NewLocalApplicationFormValues = z.infer<typeof createLocalApplicationSchema>

// NewLocalApplicationModal — the "New Local Driving License Application"
// dialog (build-plan.md § 4.2, FormModal pattern, ui-registry.md): white
// card, title + fee-notice subtitle, then the citizen combobox + license
// class select, then a light footer strip with Cancel / Create
// Application. The subtitle's fee is read LIVE from the NewDrivingLicense
// application-type row (invariant #28: never hardcode a fee in the UI);
// the class options embed each class's MinimumAllowedAge. The age gate
// itself is enforced server-side — this UI is the friendly pre-check, not
// the boundary.

const NEW_DRIVING_LICENSE_FEE = ApplicationType.NEW_DRIVING_LICENSE

export function NewLocalApplicationModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // STEP 2: RHF owns field state + errors; the resolver wires the schema.
  const form = useForm<NewLocalApplicationFormValues>({
    resolver: zodResolver(createLocalApplicationSchema),
    defaultValues: { personId: undefined, licenseClassId: undefined },
  })

  const createApplication = useCreateLocalLicenseApplication()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // STEP 3: Feeds — citizens for the combobox, classes + application
  //         types for the select/fee notice. Both lookups carry the
  //         5-minute staleTime in their own hooks (library-docs.md § 4).
  const citizens = useCitizenOptions()
  const licenseClasses = useLicenseClasses()
  const applicationTypes = useApplicationTypes()

  // STEP 4: Modal lifecycle — reset the form and drop any stale server
  //         error every time it (re)opens. The combobox owns its own
  //         open/search state and resets on close; nothing to hold here.
  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  // STEP 5: Fee notice — the NewDrivingLicense row's ApplicationFees is
  //         the current transaction fee (e.g. "15.00" → "$15.00"),
  //         displayed as-is and never computed client-side. The copy
  //         keeps the "Minimum age is enforced per license class" caveat
  //         from the spec because the violation surfaces server-side.
  const newLicenseFee = applicationTypes.data?.find(
    (type) => type.applicationTypeTitle === NEW_DRIVING_LICENSE_FEE,
  )?.applicationFees
  const feeText = newLicenseFee ? `Application fee: $${newLicenseFee}.` : "Application fee: —."

  const selectedCitizen =
    citizens.data?.find((citizen) => citizen.id === form.watch("personId")) ?? null

  // STEP 6: On submit, validated values map straight onto the request
  //         DTO; a server rejection (400 underage applicant — the real
  //         gate — or 404 unknown citizen/class) is extracted from the
  //         API envelope and shown inline.
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
      {/* STEP 7: ~500px content card per the spec — max-w-lg (512px);
              12px-ish corners via the rounded-xl pattern + crisp border
              from the Dialog ring */}
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">
            New Local Driving License Application
          </DialogTitle>
          <DialogDescription>{feeText} Minimum age is enforced per license class.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            {/* STEP 8: Applicant — the reusable SearchableCombobox
                     (ui-registry Combobox, "Select a citizen" usage) fed
                     by the full citizen set; type-to-filter over the
                     whole registry so no selectable citizen hides behind
                     a page window. */}
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

            {/* STEP 9: License Class — AnnotatedSelect pattern
                     (ui-registry.md): each option carries its constraint
                     inline, "(Min age N)" built from the live class's
                     MinimumAllowedAge — never hardcoded per class. */}
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

          {/* STEP 10: Server-side failure (400 underage, 404 unknown
                   citizen/class) surfaces in the standard alert box. */}
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