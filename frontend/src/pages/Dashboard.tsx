import { useCallback, useState, useEffect } from "react"
import { api } from "@/services/api"
import type { IntervalPoint } from "@/services/api"
import type { ForecastHistory } from "@/types"
import { FilterBar } from "@/components/FilterBar"
import { KPICard } from "@/components/KPICard"
import { AccuracyPanel } from "@/components/AccuracyPanel"
import { ActualVsForecastChart } from "@/components/ActualVsForecastChart"
import { ErrorAnalysisChart } from "@/components/ErrorAnalysisChart"
import { DataTable } from "@/components/DataTable"
import { MethodologyPanel } from "@/components/MethodologyPanel"
import { ForecastHistoryModal } from "@/components/ForecastHistoryModal"

const DEFAULT_FROM = "2026-01-01"
const DEFAULT_TO = "2026-01-31"

export function Dashboard() {
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [cutoffHour, setCutoffHour] = useState(11)

  const [overview, setOverview] = useState<any>(null)
  const [accuracy, setAccuracy] = useState<any>(null)
  const [points, setPoints] = useState<IntervalPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<ForecastHistory | null>(null)

  const run = useCallback(
    async (f: string, t: string, ch: number) => {
      setLoading(true)
      setError(null)
      setFrom(f)
      setTo(t)
      setCutoffHour(ch)
      try {
        const [o, a, ts] = await Promise.all([
          api.overview(f, t, ch),
          api.accuracy(f, t, ch),
          api.timeseries(f, t, ch),
        ])
        setOverview(o)
        setAccuracy(a)
        setPoints(ts.points)
      } catch (e: any) {
        setError(e.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    run(DEFAULT_FROM, DEFAULT_TO, 11)
  }, [run])

  const openHistory = (pt: IntervalPoint) => {
    setLoading(true)
    api.forecastHistory(pt.startTime, cutoffHour, 0)
      .then(setHistory)
      .then(() => setHistoryOpen(true))
      .catch((e: any) => setError(e.message || "Failed to load history"))
      .finally(() => setLoading(false))
  }

  const matched = points.filter((p) => p.matched)
  const tableRows = matched.slice(0, 25)

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-energy-red font-medium">{error}</p>
        <button
          onClick={() => run(from, to, cutoffHour)}
          className="mt-3 px-4 py-1.5 text-sm underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!overview || !accuracy) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        {loading && <p className="text-slate-500">Loading…</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FilterBar
        defaultFrom={DEFAULT_FROM}
        defaultTo={DEFAULT_TO}
        onRun={run}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Mean absolute error" value={`${overview.maeMw?.toFixed(1)} MW`} subtitle="Average |forecast − actual|" />
        <KPICard title="Mean forecast bias" value={`${overview.biasMw >= 0 ? "+" : ""}${overview.biasMw?.toFixed(1)} MW`} subtitle="Forecast minus actual" />
        <KPICard title="Matched intervals" value={`${overview.matchedIntervals} / ${overview.totalIntervals}`} subtitle={`${overview.dataCoveragePercent.toFixed(1)}% data coverage`} />
        <KPICard title="MAPE" value={overview.mapePercent == null ? "n/a" : `${overview.mapePercent.toFixed(1)}%`} subtitle="Zero actuals excluded" highlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActualVsForecastChart points={points} />
          <ErrorAnalysisChart points={points} />
          <DataTable points={tableRows} onRowSelect={openHistory} />
          {matched.length > 25 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Showing 25 of {matched.length} matched intervals.
            </p>
          )}
        </div>
        <div className="space-y-6">
          <AccuracyPanel accuracy={accuracy} />
          <MethodologyPanel
            period={overview.period}
            cutoff={overview.forecastCutoff}
            coverage={overview.dataCoveragePercent}
            matched={overview.matchedIntervals}
            total={overview.totalIntervals}
          />
        </div>
      </div>

      <ForecastHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        intervalStart={history?.intervalStart ?? ""}
        cutoff={history?.cutoff ?? ""}
        candidates={history?.candidates ?? []}
        selectedPublishTime={history?.selectedPublishTime ?? null}
      />
    </div>
  )
}
