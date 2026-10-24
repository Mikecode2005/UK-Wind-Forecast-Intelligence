import type { IntervalPoint } from "@/services/api"
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
    <div className="border rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Settlement-interval data
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {matched.length} matched · {unmatched.length} missing/excluded
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Delivery start</th>
              <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Period</th>
              <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right">Actual (MW)</th>
              <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right">Forecast (MW)</th>
              <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right">Error (MW)</th>
              <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-right">Forecast published</th>
              <th className="pb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => {
              const matched = p.matched
              return (
                <motion.tr
                  key={p.startTime}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}

                  className="border-b border-slate-100 dark:border-slate-800/50 cursor-pointer group"
                  onClick={() => onRowSelect?.(p)}
                >
                  <td className="py-2 text-slate-900 dark:text-slate-100 font-mono">
                    {format(new Date(p.startTime), "dd MMM HH:mm")}
                  </td>
                  <td className="py-2 text-slate-900 dark:text-slate-100">{p.settlementPeriod}</td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                    {matched ? p.actualMw!.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                    {matched ? p.forecastMw!.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                    {matched ? p.errorMw!.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                    {p.forecastPublishTime
                      ? format(new Date(p.forecastPublishTime), "dd MMM HH:mm")
                      : "—"}
                  </td>
                  <td className="py-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${matched ? "bg-energy-green/10 text-energy-green border border-energy-green/20" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"}`}
                    >
                      {matched ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-energy-green" />{" "}
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
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {matched.length > 25 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Showing 25 of {matched.length} matched intervals. Click a row to see forecast history.
        </p>
      )}
    </div>
  )
}
