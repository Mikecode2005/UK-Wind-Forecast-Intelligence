import type { IntervalPoint } from "@/types/api"
import { format } from "date-fns"
import { motion } from "framer-motion"

interface DataTableProps {
  points: IntervalPoint[]
  onRowSelect?: (point: IntervalPoint) => void
}

export function DataTable({ points, onRowSelect }: DataTableProps) {
  const matched = points.filter((p) => p.matched)
  const unmatched = points.filter((p) => !p.matched)

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Settlement-interval data</h3>
        <p className="text-xs text-slate-500">
          {matched.length} matched · {unmatched.length} missing/excluded
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Delivery start
              </th>
              <th className="pb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Period
              </th>
              <th className="pb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                Actual (MW)
              </th>
              <th className="pb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                Forecast (MW)
              </th>
              <th className="pb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                Error (MW)
              </th>
              <th className="pb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                Forecast published
              </th>
              <th className="pb-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => {
              const isMatched = p.matched
              return (
                <motion.tr
                  key={p.startTime}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.008 }}
                  className="border-b border-slate-100 hover:bg-brand-50/60 cursor-pointer transition-colors"
                  onClick={() => onRowSelect?.(p)}
                >
                  <td className="py-2.5 text-slate-800 font-mono text-[13px]">
                    {format(new Date(p.startTime), "dd MMM HH:mm")}
                  </td>
                  <td className="py-2.5 text-slate-700">{p.settlementPeriod}</td>
                  <td className="py-2.5 text-right text-slate-800 tabular-nums">
                    {isMatched ? p.actualMw!.toFixed(1) : "—"}
                  </td>
                  <td className="py-2.5 text-right text-slate-800 tabular-nums">
                    {isMatched ? p.forecastMw!.toFixed(1) : "—"}
                  </td>
                  <td
                    className={`py-2.5 text-right tabular-nums font-medium ${
                      isMatched
                        ? (p.errorMw ?? 0) >= 0
                          ? "text-red-600"
                          : "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {isMatched ? p.errorMw!.toFixed(1) : "—"}
                  </td>
                  <td className="py-2.5 text-right text-slate-600 text-[13px]">
                    {p.forecastPublishTime
                      ? format(new Date(p.forecastPublishTime), "dd MMM HH:mm")
                      : "—"}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        isMatched
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isMatched ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {isMatched ? "matched" : "missing"}
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {matched.length > 25 && (
        <p className="text-xs text-slate-500 mt-3">
          Showing 25 of {matched.length} matched intervals. Click a row to see forecast history.
        </p>
      )}
    </div>
  )
}
