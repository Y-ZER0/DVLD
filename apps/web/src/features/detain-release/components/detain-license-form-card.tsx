"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleAlert, LoaderCircle, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { ApplicationType } from "@repo/shared"
import { useApplicationTypes } from "@/features/lookup/hooks/use-application-types"
import { useEligibleLicensesForDetention } from "../hooks/use-eligible-licenses-for-detention"
import { useDetainLicense } from "../hooks/use-detain-license"

const detainLicenseSchema = z.object({
  licenseId: z.number({ message: "Select a license" }).int().positive(),
  fineFees: z
    .number({ error: "Enter the fine amount" })
    .min(0, "Fine fees cannot be negative")
    .max(99999999.99, "Fine fees exceed the maximum allowed amount")
    .refine((value) => Math.round(value * 100) / 100 === value, {
      message: "Fine fees must have at most 2 decimal places",
    }),
})

type DetainLicenseFormValues = z.infer<typeof detainLicenseSchema>

export function DetainLicenseFormCard() {
  const form = useForm<DetainLicenseFormValues>({
    resolver: zodResolver(detainLicenseSchema),
    defaultValues: { licenseId: undefined, fineFees: undefined },
  })

  const eligibleLicenses = useEligibleLicensesForDetention()
  const applicationTypes = useApplicationTypes()
  const detainLicense = useDetainLicense()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const releaseFee = applicationTypes.data?.find(
    (type) => type.applicationTypeTitle === ApplicationType.RELEASE_DETAINED_LICENSE,
  )?.applicationFees
  const feeText = releaseFee ? `$${releaseFee}` : "$—"

  const onSubmit = async (values: DetainLicenseFormValues) => {
    setSubmitError(null)
    try {
      await detainLicense.mutateAsync(values)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not detain the license. Try again."))
    }
  }

  return (
    <Card className="h-fit rounded-xl shadow-sm">
      <CardHeader className="border-b border-border px-6 py-5">
        <CardTitle className="text-lg font-semibold">Detain a license</CardTitle>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 px-6 py-5">
          <Controller
            control={form.control}
            name="licenseId"
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="license">License</Label>
                <Select
                  value={field.value !== undefined ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                  disabled={eligibleLicenses.isPending}
                >
                  <SelectTrigger
                    id="license"
                    className="h-10 w-full bg-card"
                    aria-invalid={!!fieldState.error}
                  >
                    <SelectValue
                      placeholder={
                        eligibleLicenses.isPending
                          ? "Loading licenses…"
                          : "Select active license"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(eligibleLicenses.data ?? []).map((license) => (
                      <SelectItem key={license.licenseId} value={String(license.licenseId)}>
                        {license.driverName} · LIC-{license.licenseId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {eligibleLicenses.isError && (
                  <p className="text-xs font-medium text-destructive" role="alert">
                    Could not load active licenses.{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs font-medium"
                      onClick={() => eligibleLicenses.refetch()}
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

          <Controller
            control={form.control}
            name="fineFees"
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="fineFees">Fine Fees ($)</Label>
                <InputGroup className="h-10">
                  <InputGroupAddon align="inline-start">$</InputGroupAddon>
                  <InputGroupInput
                    id="fineFees"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? undefined : e.target.valueAsNumber)
                    }}
                    onBlur={field.onBlur}
                    aria-invalid={!!fieldState.error}
                  />
                </InputGroup>
                {fieldState.error && (
                  <p className="text-xs font-medium text-destructive" role="alert">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </CardContent>

        {submitError && (
          <div
            role="alert"
            className="mx-6 mb-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          >
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">{submitError}</span>
          </div>
        )}

        <CardFooter className="block border-t border-border px-6 py-4">
          <Button type="submit" className="h-10 w-full" disabled={detainLicense.isPending}>
            {detainLicense.isPending ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Detaining…
              </>
            ) : (
              <>
                <ShieldAlert aria-hidden="true" />
                Detain license
              </>
            )}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Release collects the fine plus a {feeText} release application fee.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}