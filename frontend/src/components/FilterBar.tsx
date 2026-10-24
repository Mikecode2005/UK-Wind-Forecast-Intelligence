import { useState } from "react"

interface FilterBarProps {
  defaultFrom: string
  defaultTo: string
  onRun: (from: string, to: string, cutoffHour: number) => void
}

export function FilterBar({
  defaultFrom,
  defaultTo,
  onRun,
}: FilterBarProps) {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [cutoffHour, setCutoffHour] = useState(11)

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 flex flex-wrap items-center gap-4">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Analysis period</div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800"
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800"
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Cutoff (D-1)</div>
        <select
          value={cutoffHour}
          onChange={(e) => setCutoffHour(Number(e.target.value))}
          className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 w-20"
        >
          {[6, 9, 11, 14, 17].map((h) => (
            <option key={h} value={h}>
              {h}:00
            </option>
          ))}
        </select>
        <span className="text-[10px] text-slate-400">UK</span>
      </div>
      <button
        onClick={() => onRun(from, to, cutoffHour)}
        className="px-4 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded border border-transparent"
      >
        Refresh
      </button>
    </div>
  )
}
