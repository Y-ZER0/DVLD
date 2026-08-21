"use client"

import { useApplicationTypes } from "@/features/lookup/hooks/use-application-types"
import { useLicenseClasses } from "@/features/lookup/hooks/use-license-classes"
import { useTestTypes } from "@/features/lookup/hooks/use-test-types"
import { ApplicationTypesCard } from "./components/application-types-card"
import { LicenseClassesCard } from "./components/license-classes-card"
import { TestTypesCard } from "./components/test-types-card"

function CardSkeleton({ rows = 3, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="border-y border-border px-4 py-2">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 flex-1 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-3 w-6 animate-pulse rounded bg-muted" />
            <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
            <div className="h-8 w-[72px] animate-pulse rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
    >
      <span className="text-destructive">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted"
      >
        Try again
      </button>
    </div>
  )
}

export function ConfigurationPage() {
  const appTypes = useApplicationTypes()
  const testTypes = useTestTypes()
  const licenseClasses = useLicenseClasses()

  const isLoading = appTypes.isPending || testTypes.isPending || licenseClasses.isPending
  const isError = appTypes.isError || testTypes.isError || licenseClasses.isError

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Fees and license class rules apply immediately across all workflows.
        </p>
      </div>

      {isLoading ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <CardSkeleton rows={6} cols={3} />
            <CardSkeleton rows={3} cols={3} />
          </div>
          <CardSkeleton rows={7} cols={5} />
        </>
      ) : isError ? (
        <ErrorState
          message="Failed to load configuration. Please try again."
          onRetry={() => {
            void appTypes.refetch()
            void testTypes.refetch()
            void licenseClasses.refetch()
          }}
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <ApplicationTypesCard rows={appTypes.data ?? []} />
            <TestTypesCard rows={testTypes.data ?? []} />
          </div>
          <LicenseClassesCard rows={licenseClasses.data ?? []} />
        </>
      )}
    </div>
  )
}
