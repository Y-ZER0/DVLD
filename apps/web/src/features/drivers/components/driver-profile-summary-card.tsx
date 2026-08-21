"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DriverSummaryDto } from "@repo/shared"

function initialsFor(firstName: string, lastName: string): string {
  const a = firstName.trim().charAt(0).toUpperCase()
  const b = lastName.trim().charAt(0).toUpperCase()
  return `${a}${b}`
}

function formatDateValue(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`))
}

function formatDriverSince(isoDateTime: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDateTime))
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium" title={value}>
        {value}
      </p>
    </div>
  )
}

export function DriverProfileSummaryCard({ summary }: { summary: DriverSummaryDto }) {
  const initials = initialsFor(summary.firstName, summary.lastName)

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 shrink-0 bg-primary/10 text-primary">
            <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold">{summary.fullName}</h2>
            <p className="truncate font-mono text-sm text-muted-foreground">
              {summary.nationalNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5">
            <Field label="Date of Birth" value={formatDateValue(summary.dateOfBirth)} />
            <Field label="Email" value={summary.email} />
          </div>
          <div className="flex flex-col gap-5">
            <Field label="Gender" value={summary.gender} />
            <Field label="Address" value={summary.address} />
          </div>
          <div className="flex flex-col gap-5">
            <Field label="Phone" value={summary.phone} />
            <Field label="Driver ID" value={`DRV-${summary.driverId}`} />
          </div>
          <div className="flex flex-col gap-5">
            <Field label="Country" value={summary.countryName} />
            <Field label="Driver Since" value={formatDriverSince(summary.driverSince)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DriverProfileSummaryCardSkeleton() {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
