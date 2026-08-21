"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CircleAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { DriverLookupCard } from "./components/driver-lookup-card"
import {
  DriverProfileSummaryCard,
  DriverProfileSummaryCardSkeleton,
} from "./components/driver-profile-summary-card"
import { DriverTestLogTable } from "./components/driver-test-log-table"
import { InternationalLicenseHistoryTable } from "./components/international-license-history-table"
import { LocalLicenseHistoryTable } from "./components/local-license-history-table"
import { useDriverInternationalLicenses } from "./hooks/use-driver-international-licenses"
import { useDriverLocalLicenses } from "./hooks/use-driver-local-licenses"
import { useDriverSummary } from "./hooks/use-driver-summary"
import { useDriverTestLog } from "./hooks/use-driver-test-log"

type HistoryTab = "local" | "international" | "test-log"

interface DriversDetailPageProps {
  id: number
  initialSearch?: string
}

export function DriversDetailPage({ id, initialSearch = "" }: DriversDetailPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<HistoryTab>("local")

  const summaryQuery = useDriverSummary(id)
  const localQuery = useDriverLocalLicenses(id)
  const internationalQuery = useDriverInternationalLicenses(id)
  const testLogQuery = useDriverTestLog(id)

  const handleLookupSearch = (term: string) => {
    if (term.length > 0) {
      router.push(`/drivers?search=${encodeURIComponent(term)}`)
    } else {
      router.push("/drivers")
    }
  }

  if (summaryQuery.isPending && !summaryQuery.data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Drivers &amp; History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Look up any registered driver by National ID or Driver ID to view their complete audit
            trail.
          </p>
        </div>
        <DriverLookupCard defaultValue={initialSearch} onSearch={handleLookupSearch} />
        <DriverProfileSummaryCardSkeleton />
        <div className="flex gap-2">
          <div className="h-8 w-36 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-36 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Drivers &amp; History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Look up any registered driver by National ID or Driver ID to view their complete audit
            trail.
          </p>
        </div>
        <DriverLookupCard defaultValue={initialSearch} onSearch={handleLookupSearch} />
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center shadow-sm"
        >
          <CircleAlert aria-hidden="true" className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Could not load this driver.</p>
          <Button variant="outline" onClick={() => summaryQuery.refetch()}>
            Try again
          </Button>
        </div>
        <Link
          href="/drivers"
          className="flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all drivers
        </Link>
      </div>
    )
  }

  const summary = summaryQuery.data
  const localRows = localQuery.data ?? []
  const internationalRows = internationalQuery.data ?? []
  const testLogRows = testLogQuery.data ?? []

  const tabTriggerClass = (value: HistoryTab) =>
    cn(
      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
      activeTab === value
        ? "bg-accent font-bold text-accent-foreground shadow-sm"
        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
    )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Drivers &amp; History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Look up any registered driver by National ID or Driver ID to view their complete audit
          trail.
        </p>
      </div>

      <DriverLookupCard defaultValue={initialSearch} onSearch={handleLookupSearch} />

      <DriverProfileSummaryCard summary={summary} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as HistoryTab)}
        className="flex flex-col gap-4"
      >
        <TabsList className="h-auto w-fit gap-2 bg-transparent p-0">
          <TabsTrigger value="local" onClick={() => setActiveTab("local")} className={tabTriggerClass("local")}>
            Local Licenses ({localRows.length})
          </TabsTrigger>
          <TabsTrigger
            value="international"
            onClick={() => setActiveTab("international")}
            className={tabTriggerClass("international")}
          >
            International ({internationalRows.length})
          </TabsTrigger>
          <TabsTrigger
            value="test-log"
            onClick={() => setActiveTab("test-log")}
            className={tabTriggerClass("test-log")}
          >
            Test Log ({testLogRows.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="mt-0">
          <LocalLicenseHistoryTable
            rows={localRows}
            isPending={localQuery.isPending}
            isError={localQuery.isError}
            onRetry={() => localQuery.refetch()}
          />
        </TabsContent>

        <TabsContent value="international" className="mt-0">
          <InternationalLicenseHistoryTable
            rows={internationalRows}
            isPending={internationalQuery.isPending}
            isError={internationalQuery.isError}
            onRetry={() => internationalQuery.refetch()}
          />
        </TabsContent>

        <TabsContent value="test-log" className="mt-0">
          <DriverTestLogTable
            rows={testLogRows}
            isPending={testLogQuery.isPending}
            isError={testLogQuery.isError}
            onRetry={() => testLogQuery.refetch()}
          />
        </TabsContent>
      </Tabs>

      <Link href="/drivers" className="w-fit">
        <Button variant="outline" className="h-10 bg-card">
          <ArrowLeft aria-hidden="true" />
          Back to all drivers
        </Button>
      </Link>
    </div>
  )
}
