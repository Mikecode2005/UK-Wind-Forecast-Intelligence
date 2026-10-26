import { motion } from "framer-motion"
import type { Accuracy } from "@/types/api"

interface AccuracyPanelProps {
  accuracy: Accuracy
}

function StatCard({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string
  value: React.ReactNode
  note: string
  tone?: "default" | "blue" | "green" | "red" | "amber"
}) {
  const tones: Record<string, string> = {
    default: "border-slate-100 bg-slate-50",
    blue: "border-brand-100 bg-brand-50",
    green: "border-emerald-100 bg-emerald-50",
    red: "border-red-100 bg-red-50",
    amber: "border-amber-100 bg-amber-50",
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-xl p-3.5 text-center border ${tones[tone]}`}
    >
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-xl font-bold text-slate-900 tabular-nums tracking-tight">{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{note}</div>
    </motion.div>
  )
}

export function AccuracyPanel({ accuracy }: AccuracyPanelProps) {
  const biasSign = accuracy.biasMw >= 0 ? "+" : ""

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Forecast accuracy</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {accuracy.matchedIntervals.toLocaleString()} matched intervals
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="MAE" value={`${accuracy.maeMw.toFixed(1)}`} note="MW · avg |error|" />
        <StatCard
          label="RMSE"
          value={`${accuracy.rmseMw.toFixed(1)}`}
          note="MW · large errors"
        />
        <StatCard
          label="Bias"
          value={`${biasSign}${accuracy.biasMw.toFixed(1)}`}
          note="MW · forecast − actual"
          tone={accuracy.biasMw >= 0 ? "red" : "green"}
        />
        <StatCard
          label="MAPE"
          value={accuracy.mapePercent == null ? "n/a" : `${accuracy.mapePercent.toFixed(1)}%`}
          note="zero-actuals excluded"
          tone="amber"
        />
      </div>
    </div>
  )
}
