import { useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react"
import { api } from "@/services/api"
import { useQuery } from "@tanstack/react-query"
import { FilterBar } from "@/components/FilterBar"
import { AccuracyPanel } from "@/components/AccuracyPanel"
import { MethodologyPanel } from "@/components/MethodologyPanel"
import { useAnalysisPeriod } from "@/hooks/useAnalysisPeriod"
import { formatSafe, isJanuary2026, periodLabel } from "@/lib/dates"

export function ForecastAccuracyPage() {
  const { from, to, cutoffHour, setPeriod, setCutoffHour, setLastRefresh, refreshKey } =
    useAnalysisPeriod()

  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>({ key: "day", direction: "asc" })

  const { data: accuracy, isLoading: accLoading } = useQuery({
    queryKey: ["accuracy", from, to, cutoffHour, 0, refreshKey],
    queryFn: () => api.accuracy(from, to, cutoffHour, 0),
    enabled: !!from && !!to && from <= to,
  })

  const { data: timeseries, isLoading: tsLoading } = useQuery({
    queryKey: ["timeseries", from, to, cutoffHour, 0, refreshKey],
    queryFn: () => api.timeseries(from, to, cutoffHour, 0),
    enabled: !!from && !!to && from <= to,
  })

  const points = timeseries?.points || []
  const matched = points.filter((p) => p.matched)

  const dailyStats = useMemo(() => {
    const byDay: Record<
      string,
      { day: string; errors: number[]; actuals: number[]; forecasts: number[] }
    > = {}

    for (const p of matched) {
      const day = String(p.startTime).split("T")[0]
      if (!day || day.length < 8) continue
      if (!byDay[day]) byDay[day] = { day, errors: [], actuals: [], forecasts: [] }
      if (p.errorMw != null) byDay[day].errors.push(p.errorMw)
      if (p.actualMw != null) byDay[day].actuals.push(p.actualMw)
      if (p.forecastMw != null) byDay[day].forecasts.push(p.forecastMw)
    }

    return Object.values(byDay)
      .map((d) => {
        const n = d.errors.length
        if (n === 0) return null
        const mae = d.errors.reduce((a, b) => a + Math.abs(b), 0) / n
        const rmse = Math.sqrt(d.errors.reduce((a, b) => a + b * b, 0) / n)
        const bias = d.errors.reduce((a, b) => a + b, 0) / n
        const meanActual =
          d.actuals.length > 0
            ? d.actuals.reduce((a, b) => a + b, 0) / d.actuals.length
            : 0
        return { day: d.day, mae, rmse, bias, meanActual, n }
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)
  }, [matched])

  const sortedDaily = useMemo(() => {
    const rows = [...dailyStats]
    if (!sortConfig) return rows
    rows.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof typeof a] as number | string
      const bVal = b[sortConfig.key as keyof typeof b] as number | string
      const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortConfig.direction === "asc" ? cmp : -cmp
    })
    return rows
  }, [dailyStats, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }

  const overCount = matched.filter((p) => (p.errorMw ?? 0) > 50).length
  const nearZero = matched.filter((p) => Math.abs(p.errorMw ?? 0) <= 50).length
  const totalMatched = matched.length || 1

  const bestDay = dailyStats.length
    ? dailyStats.reduce((a, b) => (a.mae < b.mae ? a : b))
    : null
  const worstDay = dailyStats.length
    ? dailyStats.reduce((a, b) => (a.mae > b.mae ? a : b))
    : null

  const isLoading = accLoading || tsLoading
  const pilotMonth = isJanuary2026(from, to)

  if (isLoading && !accuracy) {
    return (
      <div className="flex flex-col items-center justify-center h-72">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-brand-200 border-t-brand-600" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading accuracy analysis…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 px-6 py-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.25),_transparent_55%)]" />
        <div className="relative">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-1">
            Quantitative evaluation
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Forecast accuracy · {periodLabel(from, to)}
          </h2>
          <p className="mt-1.5 text-slate-300 text-sm max-w-2xl">
            How well the D-1 selected wind forecasts matched actual generation — by day,
            error size, and systematic bias.
          </p>
        </div>
      </div>

      {!pilotMonth && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Pilot scope note:</strong> validated for <strong>January 2026</strong>. Other
          months may return partial or empty results.
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
        }}
      />

      {accuracy && accuracy.matchedIntervals > 0 && <AccuracyPanel accuracy={accuracy} />}

      {matched.length === 0 && !isLoading && (
        <div className="card p-8 text-center">
          <p className="text-slate-700 font-medium">No matched data for this period.</p>
          <p className="text-sm text-slate-500 mt-1">
            Switch back to January 2026 for the full pilot analysis.
          </p>
        </div>
      )}

      {matched.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> Best day
              </div>
              {bestDay ? (
                <>
                  <div className="text-lg font-bold text-slate-900">
                    {formatSafe(bestDay.day, "dd MMM")}
                  </div>
                  <div className="text-sm text-emerald-600 font-medium mt-0.5">
                    MAE {bestDay.mae.toFixed(0)} MW
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-sm">—</div>
              )}
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-red-500" /> Worst day
              </div>
              {worstDay ? (
                <>
                  <div className="text-lg font-bold text-slate-900">
                    {formatSafe(worstDay.day, "dd MMM")}
                  </div>
                  <div className="text-sm text-red-600 font-medium mt-0.5">
                    MAE {worstDay.mae.toFixed(0)} MW
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-sm">—</div>
              )}
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Over-forecast
              </div>
              <div className="text-lg font-bold text-slate-900">
                {((overCount / totalMatched) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                {overCount.toLocaleString()} intervals (error &gt; +50 MW)
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5 text-brand-600" /> Near-accurate
              </div>
              <div className="text-lg font-bold text-slate-900">
                {((nearZero / totalMatched) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-slate-500 mt-0.5">
                {nearZero.toLocaleString()} intervals (|error| ≤ 50 MW)
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900">Daily mean absolute error</h3>
              <p className="text-xs text-slate-500 mt-0.5">Lower is better</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyStats} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => formatSafe(String(v), "dd")}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={50}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    background: "#fff",
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => formatSafe(String(label), "dd MMM yyyy")}
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value)
                    return [`${Number.isFinite(n) ? n.toFixed(1) : "—"} MW`, "MAE"]
                  }}
                />
                <Bar dataKey="mae" radius={[4, 4, 0, 0]}>
                  {dailyStats.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        bestDay && entry.day === bestDay.day
                          ? "#10B981"
                          : worstDay && entry.day === worstDay.day
                            ? "#EF4444"
                            : "#2563EB"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Daily mean bias (forecast − actual)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Positive bars = systematic over-forecast that day
              </p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyStats} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(v) => formatSafe(String(v), "dd")}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={55}
                  tickFormatter={(v) => {
                    const n = Number(v)
                    return `${n >= 0 ? "+" : ""}${Math.round(n / 1000)}k`
                  }}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    background: "#fff",
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => formatSafe(String(label), "dd MMM yyyy")}
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value)
                    if (!Number.isFinite(n)) return ["—", "Bias"]
                    return [`${n >= 0 ? "+" : ""}${n.toFixed(1)} MW`, "Bias"]
                  }}
                />
                <Bar dataKey="bias" radius={[4, 4, 0, 0]}>
                  {dailyStats.map((entry, i) => (
                    <Cell key={i} fill={entry.bias >= 0 ? "#EF4444" : "#10B981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Daily performance detail</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click headers to sort · each day has up to 48 half-hour intervals
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    {(
                      [
                        ["day", "Date", "left"],
                        ["mae", "MAE (MW)", "right"],
                        ["rmse", "RMSE (MW)", "right"],
                        ["bias", "Bias (MW)", "right"],
                        ["meanActual", "Mean actual (MW)", "right"],
                      ] as const
                    ).map(([key, label, align]) => (
                      <th
                        key={key}
                        className={`pb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 ${
                          align === "right" ? "text-right" : ""
                        }`}
                        onClick={() => handleSort(key)}
                      >
                        {label}
                        {sortConfig?.key === key &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDaily.map((d) => (
                    <tr
                      key={d.day}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 text-slate-900 font-medium">
                        {formatSafe(d.day, "EEE dd MMM")}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-slate-800">
                        {d.mae.toFixed(1)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-slate-800">
                        {d.rmse.toFixed(1)}
                      </td>
                      <td
                        className={`py-2.5 text-right tabular-nums font-medium ${
                          d.bias >= 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {d.bias >= 0 ? "+" : ""}
                        {d.bias.toFixed(1)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-slate-600">
                        {d.meanActual.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <MethodologyPanel
        period={periodLabel(from, to)}
        cutoff={`${cutoffHour}:00 UK (D-1)`}
        coverage={accuracy ? 100 : 0}
        matched={accuracy?.matchedIntervals || 0}
        total={accuracy?.matchedIntervals || 0}
      />
    </div>
  )
}
