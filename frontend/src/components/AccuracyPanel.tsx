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
    default: "border-slate-200 bg-slate-50",
    blue: "border-brand-200 bg-brand-50 ring-1 ring-brand-100",
    green: "border-emerald-200 bg-emerald-50",
    red: "border-red-200 bg-red-50",
    amber: "border-amber-200 bg-amber-50",
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl p-3.5 text-center border ${tones[tone]}`}
    >
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-xl font-bold text-slate-900 tabular-nums">{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{note}</div>
    </motion.div>
  )
}

export function AccuracyPanel({ accuracy }: AccuracyPanelProps) {
  const biasSign = accuracy.biasMw >= 0 ? "+" : ""

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Forecast accuracy</h3>
        <p className="text-xs text-slate-500">
          {accuracy.matchedIntervals.toLocaleString()} matched intervals
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="MAE" value={`${accuracy.maeMw.toFixed(1)} MW`} note="avg |error|" />
        <StatCard
          label="RMSE"
          value={`${accuracy.rmseMw.toFixed(1)} MW`}
          note="penalises large errors"
        />
        <StatCard
          label="Bias"
          value={`${biasSign}${accuracy.biasMw.toFixed(1)} MW`}
          note="forecast − actual"
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
