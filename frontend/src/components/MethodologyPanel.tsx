import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-semibold text-slate-900">
          Methodology — how the forecast was selected
        </h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-slate-400 text-lg leading-none"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                For each half-hour delivery interval in {period || "the analysis window"}, we
                select the latest WINDFOR wind forecast published before the decision cutoff
                on the day before delivery (D-1). This reflects what the procurement team knew
                when making its day-ahead buying decision.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Analysis period
                  </div>
                  <div className="text-sm font-mono text-slate-900 mt-0.5">{period || "—"}</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Decision cutoff
                  </div>
                  <div className="text-sm font-mono text-slate-900 mt-0.5">{cutoff || "—"}</div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Data coverage: {matched.toLocaleString()} / {total.toLocaleString()} intervals
                ({coverage.toFixed(1)}% matched)
              </p>

              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <p className="text-xs text-amber-800 font-medium">
                  Assumption: the 11:00 default cutoff is a modelling assumption, not a verified
                  trading deadline. It is configurable via the API and UI.
                </p>
              </div>

              <details className="text-xs text-slate-500">
                <summary className="font-medium cursor-pointer text-slate-600 hover:text-slate-900">
                  Data sources
                </summary>
                <p className="mt-2 leading-relaxed">
                  Elexon BMRS: <strong>FUELHH</strong> (actual wind generation outturn,
                  half-hourly) and <strong>WINDFOR</strong> (wind generation forecasts, hourly
                  start times). All timestamps are timezone-aware and compared in UK local
                  market time.
                </p>
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
