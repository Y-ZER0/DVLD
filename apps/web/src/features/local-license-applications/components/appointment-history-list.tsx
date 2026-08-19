"use client"

import { CalendarX2 } from "lucide-react"
import type { TestAppointmentDto } from "@repo/shared"

function formatFee(paidFees: string): string {
  return `$${paidFees}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

export function AppointmentHistoryList({ history }: { history: TestAppointmentDto[] }) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-10 text-center">
        <CalendarX2 aria-hidden="true" className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">No appointments yet</p>
        <p className="text-xs text-muted-foreground">
          Booked test slots will appear here once scheduled.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((appointment) => {
        const hasResult = appointment.test !== null
        return (
          <div
            key={appointment.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {appointment.testTypeTitle} · {formatDate(appointment.appointmentDate)}
              </p>
              {appointment.test?.notes && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground" title={appointment.test.notes}>
                  {appointment.test.notes}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm tabular-nums">{formatFee(appointment.paidFees)}</span>
              {!hasResult && (
                <span className="rounded-full bg-warning-tint px-2.5 py-0.5 text-xs font-medium text-warning-tint-foreground">
                  Pending
                </span>
              )}
              {appointment.test?.result === true && (
                <>
                  <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success-tint-foreground">
                    Passed
                  </span>
                  <span className="rounded-full bg-neutral-tint px-2.5 py-0.5 text-xs font-medium text-neutral-tint-foreground">
                    Locked
                  </span>
                </>
              )}
              {hasResult && appointment.test?.result === false && (
                <>
                  <span className="rounded-full bg-destructive-tint px-2.5 py-0.5 text-xs font-medium text-destructive">
                    Failed
                  </span>
                  <span className="rounded-full bg-neutral-tint px-2.5 py-0.5 text-xs font-medium text-neutral-tint-foreground">
                    Locked
                  </span>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}