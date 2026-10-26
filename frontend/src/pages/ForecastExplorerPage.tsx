import { useState } from "react"
import { format } from "date-fns"
import { api } from "@/services/api"
import { useQuery } from "@tanstack/react-query"
import type { IntervalPoint } from "@/types/api"
import { FilterBar } from "@/components/FilterBar"

const DEFAULT_FROM = "2026-01-01"
const DEFAULT_TO = "2026-01-31"

export function ForecastExplorerPage() {
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [cutoffHour, setCutoffHour] = useState(11)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)

  const { data: timeseries } = useQuery({
    queryKey: ["timeseries", from, to, cutoffHour, 0],
    queryFn: () => api.timeseries(from, to, cutoffHour, 0),
    enabled: !!(from && to),
  })

  const points = timeseries?.points || []
  const matched = points.filter((p) => p.matched)

  const openHistory = async (pt: IntervalPoint) => {
    try {
      await api.forecastHistory(pt.startTime, cutoffHour, 0)
      // History modal can be wired here later
    } catch (e) {
      console.error(e)
    }
  }

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }

  const sortedData = [...matched].sort((a: IntervalPoint, b: IntervalPoint) => {
    if (!sortConfig) return 0
    const aVal = a[sortConfig.key as keyof IntervalPoint]
    const bVal = b[sortConfig.key as keyof IntervalPoint]
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return sortConfig.direction === "asc" ? 1 : -1
    if (bVal == null) return sortConfig.direction === "asc" ? -1 : 1
    const comparison = aVal > bVal ? 1 : -1
    return sortConfig.direction === "asc" ? comparison : -comparison
  })

  return (
    <div className="space-y-6">
      <FilterBar
        defaultFrom={DEFAULT_FROM}
        defaultTo={DEFAULT_TO}
        onRun={(f, t, ch) => {
          setFrom(f)
          setTo(t)
          setCutoffHour(ch ?? 11)
        }}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Forecast Publications
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {matched.length} matched intervals
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th
                  className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => handleSort("startTime")}
                >
                  Delivery start
                </th>
                <th
                  className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => handleSort("settlementPeriod")}
                >
                  Period
                </th>
                <th
                  className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => handleSort("actualMw")}
                >
                  Actual (MW)
                </th>
                <th
                  className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => handleSort("forecastMw")}
                >
                  Forecast (MW)
                </th>
                <th
                  className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => handleSort("errorMw")}
                >
                  Error (MW)
                </th>
                <th
                  className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => handleSort("forecastPublishTime")}
                >
                  Forecast published
                </th>
                <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((p) => (
                <tr
                  key={p.startTime}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 cursor-pointer"
                  onClick={() => openHistory(p)}
                >
                  <td className="py-2 text-slate-900 dark:text-slate-100 font-mono">
                    {format(new Date(p.startTime), "dd MMM HH:mm")}
                  </td>
                  <td className="py-2 text-slate-900 dark:text-slate-100">
                    {p.settlementPeriod}
                  </td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                    {p.matched ? p.actualMw!.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                    {p.matched ? p.forecastMw!.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                    {p.matched ? p.errorMw!.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                    {p.forecastPublishTime
                      ? format(new Date(p.forecastPublishTime), "dd MMM HH:mm")
                      : "—"}
                  </td>
                  <td className="py-2">
                    <span
                      className={
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium " +
                        (p.matched
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700")
                      }
                    >
                      {p.matched ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
                          matched
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />{" "}
                          missing
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openHistory(p)
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View history
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
