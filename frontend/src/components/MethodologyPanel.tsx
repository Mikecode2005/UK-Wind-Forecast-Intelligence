import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Info } from "lucide-react"

interface MethodologyPanelProps {
  period: string
  cutoff: string
  coverage: number
  matched: number
  total: number
}

export function MethodologyPanel({
  period,
  cutoff,
  coverage,
  matched,
  total,
}: MethodologyPanelProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Info className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Methodology</h3>
            <p className="text-[11px] text-slate-500">How the forecast vintage was selected</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                For each half-hour delivery interval we select the latest WINDFOR
                forecast published before the decision cutoff on the day before
                delivery (D-1). This mirrors what the procurement team knew when
                placing day-ahead bids — not the latest forecast available today.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Period
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-1 font-mono">
                    {period || "—"}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cutoff (D-1)
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-1 font-mono">
                    {cutoff || "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Coverage: {matched.toLocaleString()} / {total.toLocaleString()} intervals
                </span>
                <span className="font-semibold text-brand-600">{coverage.toFixed(1)}%</span>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-2.5">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Assumption:</span> 11:00 UK on D-1 is a
                  modelling default, not a verified market gate. It is configurable in the
                  UI and API.
                </p>
              </div>

              <details className="text-xs text-slate-500 group">
                <summary className="font-medium cursor-pointer text-slate-600 hover:text-brand-600 list-none flex items-center gap-1">
                  <span className="group-open:rotate-90 transition-transform">▸</span>
                  Data sources
                </summary>
                <p className="mt-2 leading-relaxed pl-3 border-l-2 border-slate-200">
                  Elexon BMRS <strong>FUELHH</strong> (WIND actuals, half-hourly) and{" "}
                  <strong>WINDFOR</strong> (wind forecasts). Timestamps are timezone-aware
                  and compared in UK local market time.
                </p>
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
