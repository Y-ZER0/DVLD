"use client"

import { Badge } from "@/components/ui/badge"
import type { DashboardUpcomingAppointmentDto } from "@repo/shared"

function formatDate(iso: string): string {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function UpcomingTestAppointmentsCard({
  rows,
}: {
  rows: DashboardUpcomingAppointmentDto[]
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold">Upcoming Test Appointments</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pending, unlocked appointments awaiting results.
        </p>
      </div>
      <div className="px-5 pb-5">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.appointmentId}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{row.applicantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.testTypeTitle} Test · {formatDate(row.appointmentDate)}
                  </p>
                </div>
                <Badge className="bg-warning-tint text-warning-tint-foreground border-transparent">
                  Scheduled
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
