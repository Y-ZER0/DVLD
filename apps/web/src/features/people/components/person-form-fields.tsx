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