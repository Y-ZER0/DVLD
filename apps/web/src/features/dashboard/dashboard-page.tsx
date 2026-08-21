"use client"

import { CalendarClock, Car, Copy, Gavel } from "lucide-react"
import { RecentApplicationsCard } from "./components/recent-applications-card"
import { StatCard } from "./components/stat-card"
import { UpcomingTestAppointmentsCard } from "./components/upcoming-test-appointments-card"
import { useDashboardSummary } from "./hooks/use-dashboard-summary"

function StatSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-8 w-12 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-3 w-32 animate-pulse rounded bg-muted" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="px-5 pt-5 pb-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-2 px-5 pb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data, isPending, isError, refetch } = useDashboardSummary()

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational overview of licensing activity across the department.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TableSkeleton />
          </div>
          <TableSkeleton />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational overview of licensing activity across the department.
          </p>
        </div>
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
        >
          <span className="text-destructive">Could not load dashboard data.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Operational overview of licensing activity across the department.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Applications"
          value={data.activeApplications}
          description="In-progress local license applications"
          href="/applications/local"
          icon={Copy}
        />
        <StatCard
          label="Tests Today"
          value={data.testsToday}
          description={`${data.pendingAppointments} pending appointment${data.pendingAppointments === 1 ? "" : "s"} overall`}
          href="/applications/local"
          icon={CalendarClock}
        />
        <StatCard
          label="Active Drivers"
          value={data.activeDrivers}
          description={`${data.activeLicenses} active local licenses`}
          href="/drivers"
          icon={Car}
        />
        <StatCard
          label="Detained Licenses"
          value={data.detainedLicenses}
          description="Awaiting release clearance"
          href="/detain-release"
          icon={Gavel}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentApplicationsCard rows={data.recentApplications} />
        </div>
        <UpcomingTestAppointmentsCard rows={data.upcomingTestAppointments} />
      </div>
    </div>
  )
}
