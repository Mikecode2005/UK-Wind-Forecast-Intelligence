import { useState } from "react"
import { api } from "@/services/api"
import { useQuery } from "@tanstack/react-query"
import type { IntervalPoint } from "@/types/api"
import { KPICard } from "@/components/KPICard"
import { ActualVsForecastChart } from "@/components/ActualVsForecastChart"
import { ErrorAnalysisChart } from "@/components/ErrorAnalysisChart"
import { DataTable } from "@/components/DataTable"
import { AccuracyPanel } from "@/components/AccuracyPanel"
import { MethodologyPanel } from "@/components/MethodologyPanel"
import { FilterBar } from "@/components/FilterBar"

const DEFAULT_FROM = "2026-01-01"
const DEFAULT_TO = "2026-01-31"

export function OverviewPage() {
  const [from] = useState(DEFAULT_FROM)
  const [to] = useState(DEFAULT_TO)
  const [cutoffHour] = useState(11)

  const { data: overview, isLoading: ovLoading } = useQuery({
    queryKey: ["overview", from, to, cutoffHour, 0],
    queryFn: () => api.overview(from, to, cutoffHour, 0),
  })

  const { data: timeseries, isLoading: tsLoading } = useQuery({
    queryKey: ["timeseries", from, to, cutoffHour, 0],
    queryFn: () => api.timeseries(from, to, cutoffHour, 0),
  })

  const { data: accuracy, isLoading: accLoading } = useQuery({
    queryKey: ["accuracy", from, to, cutoffHour, 0],
    queryFn: () => api.accuracy(from, to, cutoffHour, 0),
  })

  const isLoading = ovLoading || tsLoading || accLoading

  const openHistory = async (pt: IntervalPoint) => {
    try {
      await api.forecastHistory(pt.startTime, cutoffHour, 0)
    } catch (e: any) {
      console.error(e)
    }
  }

  const points = timeseries?.points || []
  const matched = points.filter((p) => p.matched)
  const tableRows = matched.slice(0, 25)

  if (isLoading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-4 text-slate-500">Loading wind forecast intelligence...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FilterBar
        defaultFrom="2026-01-01"
        defaultTo="2026-01-31"
        onRun={() => {}}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Analysis period: {from} to {to}</span>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded">
            Historical analysis \u2013 not a live forecast
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Cutoff: {cutoffHour}:00 UK (D-1)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Mean Absolute Error" value={overview ? overview.maeMw?.toFixed(1) + " MW" : "\u2014 MW"} subtitle="Average |forecast \u2212 actual|" />
        <KPICard title="Root Mean Squared Error" value={overview ? overview.rmseMw?.toFixed(1) + " MW" : "\u2014 MW"} subtitle="Penalizes larger deviations" />
        <KPICard title="Mean Forecast Bias" value={overview ? (overview.biasMw ?? 0 >= 0 ? "+" : "") + (overview.biasMw ?? 0).toFixed(1) + " MW" : "\u2014 MW"} subtitle="Forecast \u2212 actual (positive = overforecast)" />
        <KPICard title="Data Coverage" value={overview ? overview.dataCoveragePercent.toFixed(1) + "%" : "\u2014 %"} subtitle={overview ? overview.matchedIntervals + " / " + overview.totalIntervals + " intervals" : "\u2014"} highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActualVsForecastChart points={points} />
          <ErrorAnalysisChart points={points} />
          <DataTable points={tableRows} onRowSelect={openHistory} />
        </div>
        <div className="space-y-6">
          <AccuracyPanel accuracy={accuracy || { period: "", matchedIntervals: 0, maeMw: 0, rmseMw: 0, biasMw: 0, mapePercent: null, meanActualMw: 0, meanForecastMw: 0, intervals: [] }} />
          <MethodologyPanel period={overview?.period || ""} cutoff={overview?.forecastCutoff || ""} coverage={overview?.dataCoveragePercent || 0} matched={overview?.matchedIntervals || 0} total={overview?.totalIntervals || 0} />
        </div>
      </div>
    </div>
  )
}