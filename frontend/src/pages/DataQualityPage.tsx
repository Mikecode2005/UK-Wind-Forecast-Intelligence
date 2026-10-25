import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Database, Wifi, AlertTriangle, ChevronRight } from "lucide-react"
import { api } from "@/services/api"
import { useQuery } from "@tanstack/react-query"
import type { DataQuality } from "@/types/api"
import { FilterBar } from "@/components/dashboard/FilterBar"
import { MethodologyPanel } from "@/components/dashboard/MethodologyPanel"

const DEFAULT_FROM = "2026-01-01"
const DEFAULT_TO = "2026-01-31"

export function DataQualityPage() {
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [cutoffHour, setCutoffHour] = useState(11)

  const { data: quality, isLoading } = useQuery({
    queryKey: ["dataQuality", from, to, cutoffHour, 0],
    queryFn: () => api.dataQuality(from, to, cutoffHour, 0),
    enabled: !!(from && to),
  })

  if (isLoading && !quality) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-4 text-slate-500">Loading data quality metrics...</p>
      </div>
    )
  }

  const metrics = quality ? [
    { label: "Actual generation records", value: quality.actualsRetrieved, icon: Database, color: "blue" },
    { label: "Forecast records", value: quality.forecastsRetrieved, icon: Wifi, color: "green" },
    { label: "Matched intervals", value: quality.matchedIntervals, icon: CheckCircle, color: "green" },
    { label: "Missing actuals", value: quality.missingActuals, icon: AlertCircle, color: "red" },
    { label: "Missing eligible forecasts", value: quality.missingEligibleForecasts, icon: AlertCircle, color: "amber" },
    { label: "Duplicates", value: quality.duplicates, icon: XCircle, color: "red" },
    { label: "Invalid values", value: quality.invalidValues, icon: AlertTriangle, color: "red" },
    { label: "Excluded after cutoff", value: quality.excludedAfterCutoff, icon: ChevronRight, color: "blue" },
  ] : []

  return (
    <div className="space-y-6">
      <FilterBar
        defaultFrom={DEFAULT_FROM}
        defaultTo={DEFAULT_TO}
        onRun={() => {}}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="border rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`w-5 h-5 text-${m.color}-600 dark:text-${m.color}-400`} />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{m.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{m.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="border rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Retrieval Details</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Retrieval time</dt>
          <dd className="text-slate-900 dark:text-slate-100 font-mono">{quality?.retrievalTimeMs} ms</dd>
          <dt className="text-slate-500 dark:text-slate-400">Source status</dt>
          <dd className="text-slate-900 dark:text-slate-100">{quality?.sourceStatus}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Period</dt>
          <dd className="text-slate-900 dark:text-slate-100">{DEFAULT_FROM} to {DEFAULT_TO}</dd>
          <dt className="text-slate-500 dark:text-slate-400">Cutoff</dt>
          <dd className="text-slate-900 dark:text-slate-100">{cutoffHour}:00 UK (D-1)</dd>
        </dl>
      </div>

      <MethodologyPanel period="{from} to {to}" cutoff="{cutoffHour}:00 UK (D-1)" coverage={0} matched={0} total={0} />
    </div>
  )
}
