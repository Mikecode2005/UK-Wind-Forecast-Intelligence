import { useState } from "react"
import { motion } from "framer-motion"

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
    <div className="border rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full"
      >
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Methodology — how the forecast was selected
        </h3>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="transition-transform"
        >
          ▾
        </motion.span>
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="mt-3 overflow-hidden"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          For each half-hour delivery interval in {period}, we select the latest
          WINDFOR wind forecast published before the decision cutoff on the day
          before delivery (D-1). This reflects what the procurement team knew when
          making its day-ahead buying decision, rather than comparing against the
          latest forecast available today.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-slate-200 dark:bg-slate-800 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Analysis period</div>
            <div className="text-sm font-mono text-slate-900 dark:text-slate-100">{period}</div>
          </div>
          <div className="bg-slate-200 dark:bg-slate-800 rounded-lg p-3">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Decision cutoff</div>
            <div className="text-sm font-mono text-slate-900 dark:text-slate-100">{cutoff}</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Data coverage: {matched} / {total} intervals ({coverage.toFixed(1)}% matched)
        </p>
        <p className="text-xs text-energy-amber dark:text-energy-amber/90 font-medium mb-3">
          Assumption: the 11:00 default cutoff is a modelling assumption, not a verified trading deadline. It is configurable via the API.
        </p>
        <details className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <summary className="font-medium cursor-pointer">Data sources</summary>
          <p className="ml-2 mt-1">
            Elexon BMRS: <b>FUELHH</b> (actual wind generation outturn, half-hourly)
            and <b>WINDFOR</b> (wind generation forecasts, hourly start times). All
            timestamps are timezone-aware and compared in UK local market time.
          </p>
        </details>
      </motion.div>
    </div>
  )
}
