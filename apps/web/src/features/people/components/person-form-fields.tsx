"use client"

import type { UseFormReturn } from "react-hook-form"
import { Controller } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Gender } from "@repo/shared"
import { COUNTRY_OPTIONS } from "../countries"
import type { PersonFormValues } from "./person-form-values"

// PersonFormFields — the shared field grid for the Add/Edit Person modals
// (FormModal pattern, ui-registry.md): National Number full width, First/
// Last Name and DOB/Gender in two-column rows, Address full width,
// Phone/Email two-column, Country full width. Owns NO form state — it just
// binds the caller's react-hook-form instance to the inputs, so the two
// modals (with their own schemas) render one identical grid.

interface PersonFormFieldsProps {
  form: UseFormReturn<PersonFormValues>
}

export function PersonFormFields({ form }: PersonFormFieldsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <div className="space-y-4">
      {/* STEP 1: Row 1 — National Number, full width. The regex rule lives
               in the schema; here we only wire id/label (ui-rules.md a11y
               pairing) and render the resolver's error under the field. */}
      <div className="space-y-1.5">
        <Label htmlFor="nationalNumber">National Number</Label>
        <Input
          id="nationalNumber"
          className="h-10"
          placeholder="N-12345678"
          aria-invalid={!!errors.nationalNumber}
          {...register("nationalNumber")}
        />
        {errors.nationalNumber && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {errors.nationalNumber.message}
          </p>
        )}
      </div>

      {/* STEP 2: Row 2 — First/Last Name, two columns. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            className="h-10"
            placeholder="John"
            aria-invalid={!!errors.firstName}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            className="h-10"
            placeholder="Doe"
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* STEP 3: Row 3 — Date of Birth / Gender. DOB is a native date
               input whose calendar indicator is hidden so the layout
               shows exactly ONE calendar icon (our own, right). The
               hidden indicator is stretched across the whole field
               (absolute inset-0) so a click ANYWHERE on the input opens
               the browser calendar in Chromium; the showPicker() call
               covers Firefox/Safari, which otherwise never open the
               picker from the field body. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <div className="relative">
            <Input
              id="dateOfBirth"
              type="date"
              className="h-10 cursor-pointer pr-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-auto [&::-webkit-calendar-picker-indicator]:w-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
              aria-invalid={!!errors.dateOfBirth}
              {...register("dateOfBirth")}
              onClick={(event) => event.currentTarget.showPicker?.()}
            />
            <CalendarIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          {/* STEP 4: Gender is a Select — controlled state, so it binds
                   via Controller instead of register (RHF cannot register
                   a non-input). The enum's TS value equals the DB label.
                   The trigger carries the id the Label's htmlFor points at
                   (ui-rules.md htmlFor/id pairing on every control). */}
          <Label htmlFor="gender">Gender</Label>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="gender"
                  className="h-10"
                  aria-invalid={!!errors.gender}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>Male</SelectItem>
                  <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>

      {/* STEP 5: Row 4 — Address, full width. */}
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          className="h-10"
          placeholder="123 Main Street"
          aria-invalid={!!errors.address}
          {...register("address")}
        />
        {errors.address && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {errors.address.message}
          </p>
        )}
      </div>

      {/* STEP 6: Row 5 — Phone / Email, two columns. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            className="h-10"
            placeholder="+1 (555) 000-0000"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="h-10"
            placeholder="john.doe@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* STEP 7: Row 6 — Country, full width select. Same htmlFor/id
               pairing as Gender (ui-rules.md). */}
      <div className="space-y-1.5">
        <Label htmlFor="countryName">Country</Label>
        <Controller
          control={control}
          name="countryName"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="countryName"
                className="h-10"
                aria-invalid={!!errors.countryName}
              >
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.countryName && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {errors.countryName.message}
          </p>
        )}
      </div>
    </div>
  )
}