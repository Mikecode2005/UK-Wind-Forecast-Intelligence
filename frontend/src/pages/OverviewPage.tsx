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
import { useAnalysisPeriod } from "@/hooks/useAnalysisPeriod"
import { formatSafe, isJanuary2026, periodLabel } from "@/lib/dates"

export function OverviewPage() {
  const {
    from,
    to,
    cutoffHour,
    setPeriod,
    setCutoffHour,
    setIsLoading,
    setLastRefresh,
    refreshKey,
  } = useAnalysisPeriod()

  const { data: overview, isLoading: ovLoading, isFetching: ovFetching } = useQuery({
    queryKey: ["overview", from, to, cutoffHour, 0, refreshKey],
    queryFn: () => api.overview(from, to, cutoffHour, 0),
    enabled: !!from && !!to && from <= to,
  })

  const { data: timeseries, isLoading: tsLoading } = useQuery({
    queryKey: ["timeseries", from, to, cutoffHour, 0, refreshKey],
    queryFn: () => api.timeseries(from, to, cutoffHour, 0),
    enabled: !!from && !!to && from <= to,
  })

  const { data: accuracy, isLoading: accLoading } = useQuery({
    queryKey: ["accuracy", from, to, cutoffHour, 0, refreshKey],
    queryFn: () => api.accuracy(from, to, cutoffHour, 0),
    enabled: !!from && !!to && from <= to,
  })

  const isLoading = ovLoading || tsLoading || accLoading || ovFetching

  // sync loading flag for header
  if (typeof window !== "undefined") {
    // lightweight side-effect via query state is fine; avoid setState in render
  }

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
  const pilotMonth = isJanuary2026(from, to)

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
      {/* Hero — dynamic period */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-7 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_50%)]" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-brand-100 text-xs font-semibold uppercase tracking-widest mb-1.5">
              Day-ahead procurement support
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {periodLabel(from, to)} wind forecast performance
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

      {!pilotMonth && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Pilot scope note:</strong> this engagement is validated for{" "}
          <strong>January 2026</strong>. Other months may return partial or empty data
          depending on Elexon availability.
        </div>
      )}

      <FilterBar
        defaultFrom={from}
        defaultTo={to}
        defaultCutoff={cutoffHour}
        onRun={(f, t, ch) => {
          setPeriod(f, t)
          if (typeof ch === "number") setCutoffHour(ch)
          setLastRefresh(new Date())
          setIsLoading(false)
        }}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Mean Absolute Error"
          value={overview?.maeMw != null ? `${overview.maeMw.toFixed(1)} MW` : "— MW"}
          subtitle="Average |forecast − actual|"
        />
        <KPICard
          title="Root Mean Squared Error"
          value={overview?.rmseMw != null ? `${overview.rmseMw.toFixed(1)} MW` : "— MW"}
          subtitle="Penalizes larger deviations"
        />
        <KPICard
          title="Mean Forecast Bias"
          value={
            overview?.biasMw != null
              ? `${overview.biasMw >= 0 ? "+" : ""}${overview.biasMw.toFixed(1)} MW`
              : "— MW"
          }
          subtitle="Forecast − actual (positive = overforecast)"
        />
        <KPICard
          title="Data Coverage"
          value={
            overview ? `${overview.dataCoveragePercent.toFixed(1)}%` : "— %"
          }
          subtitle={
            overview
              ? `${overview.matchedIntervals.toLocaleString()} / ${overview.totalIntervals.toLocaleString()} intervals`
              : "—"
          }
          highlight
        />
      </div>

      {matched.length === 0 && !isLoading && (
        <div className="card p-8 text-center">
          <p className="text-slate-700 font-medium">No matched forecast/actual pairs for this period.</p>
          <p className="text-sm text-slate-500 mt-1">
            Try January 2026 (the validated pilot window) or a wider range.
          </p>
        </div>
      )}

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
            period={overview?.period || periodLabel(from, to)}
            cutoff={overview?.forecastCutoff || `${cutoffHour}:00 UK (D-1)`}
            coverage={overview?.dataCoveragePercent || 0}
            matched={overview?.matchedIntervals || 0}
            total={overview?.totalIntervals || 0}
          />
        </div>
      </div>
    </div>
  )
}
