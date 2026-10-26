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
    } catch (e) {
      console.error(e)
    }
  }

  const points = timeseries?.points || []
  const matched = points.filter((p) => p.matched)
  const tableRows = matched.slice(0, 25)

  if (isLoading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center h-72">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-brand-200 border-t-brand-600" />
        <p className="mt-4 text-sm text-slate-500 font-medium">
          Loading wind forecast intelligence…
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-7 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_50%)]" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-brand-100 text-xs font-semibold uppercase tracking-widest mb-1.5">
              Day-ahead procurement support
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              January 2026 wind forecast performance
            </h2>
            <p className="mt-2 text-brand-100 text-sm max-w-xl leading-relaxed">
              What the procurement team knew at decision time — and how accurate those
              forecasts turned out against actual generation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/15 text-xs font-medium backdrop-blur-sm border border-white/20">
              Cutoff {cutoffHour}:00 UK · D-1
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-50 text-xs font-medium border border-amber-300/30">
              Historical analysis — not live
            </span>
          </div>
        </div>
      </div>

      <FilterBar defaultFrom={DEFAULT_FROM} defaultTo={DEFAULT_TO} onRun={() => {}} />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Mean Absolute Error"
          value={overview ? `${overview.maeMw?.toFixed(1)} MW` : "— MW"}
          subtitle="Average |forecast − actual|"
        />
        <KPICard
          title="Root Mean Squared Error"
          value={overview ? `${overview.rmseMw?.toFixed(1)} MW` : "— MW"}
          subtitle="Penalizes larger deviations"
        />
        <KPICard
          title="Mean Forecast Bias"
          value={
            overview
              ? `${(overview.biasMw ?? 0) >= 0 ? "+" : ""}${(overview.biasMw ?? 0).toFixed(1)} MW`
              : "— MW"
          }
          subtitle="Forecast − actual (positive = overforecast)"
        />
        <KPICard
          title="Data Coverage"
          value={overview ? `${overview.dataCoveragePercent.toFixed(1)}%` : "— %"}
          subtitle={
            overview
              ? `${overview.matchedIntervals.toLocaleString()} / ${overview.totalIntervals.toLocaleString()} intervals`
              : "—"
          }
          highlight
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActualVsForecastChart points={points} />
          <ErrorAnalysisChart points={points} />
          <DataTable points={tableRows} onRowSelect={openHistory} />
        </div>
        <div className="space-y-6">
          <AccuracyPanel
            accuracy={
              accuracy || {
                period: "",
                matchedIntervals: 0,
                maeMw: 0,
                rmseMw: 0,
                biasMw: 0,
                mapePercent: null,
                meanActualMw: 0,
                meanForecastMw: 0,
                intervals: [],
              }
            }
          />
          <MethodologyPanel
            period={overview?.period || ""}
            cutoff={overview?.forecastCutoff || ""}
            coverage={overview?.dataCoveragePercent || 0}
            matched={overview?.matchedIntervals || 0}
            total={overview?.totalIntervals || 0}
          />
        </div>
      </div>
    </div>
  )
}
