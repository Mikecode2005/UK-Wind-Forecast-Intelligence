import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface FilterBarProps {
  defaultFrom: string
  defaultTo: string
  defaultCutoff?: number
  onRun: (from: string, to: string, cutoffHour?: number) => void
}

export function FilterBar({
  defaultFrom,
  defaultTo,
  defaultCutoff = 11,
  onRun,
}: FilterBarProps) {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [cutoffHour, setCutoffHour] = useState(defaultCutoff)

  // Keep local inputs in sync when parent period changes
  useEffect(() => {
    setFrom(defaultFrom)
    setTo(defaultTo)
  }, [defaultFrom, defaultTo])

  useEffect(() => {
    setCutoffHour(defaultCutoff)
  }, [defaultCutoff])

  const apply = () => {
    if (!from || !to || from > to) return
    onRun(from, to, cutoffHour)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl shadow-card p-4 flex flex-wrap items-center gap-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Analysis period
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            min="2026-01-01"
            max="2026-12-31"
            onChange={(e) => setFrom(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={to}
            min="2026-01-01"
            max="2026-12-31"
            onChange={(e) => setTo(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Cutoff (D-1)
        </span>
        <select
          value={cutoffHour}
          onChange={(e) => setCutoffHour(Number(e.target.value))}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          {[6, 9, 11, 14, 17].map((h) => (
            <option key={h} value={h}>
              {h}:00
            </option>
          ))}
        </select>
        <span className="text-[11px] text-slate-400 font-medium">UK</span>
      </div>

      <button onClick={apply} className="btn-primary ml-auto">
        Apply period
      </button>
    </motion.div>
  )
}
