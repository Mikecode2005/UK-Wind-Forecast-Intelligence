import { motion } from "framer-motion"
import type { Accuracy } from "@/types"

interface AccuracyPanelProps {
  accuracy: Accuracy
}

const stat = (
  label: string,
  value: React.ReactNode,
  note: string,
  color: "slate" | "blue" | "green" | "red" | "amber" = "slate"
) => {
  const colorMap: Record<string, string> = {
    slate: "text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60",
    blue: "text-slate-900 dark:text-slate-100 border-energy-blue/50 ring-1 ring-energy-blue/20 bg-energy-blue/5",
    green: "text-slate-900 dark:text-slate-100 border-energy-green/50 ring-1 ring-energy-green/20 bg-energy-green/5",
    red: "text-slate-900 dark:text-slate-100 border-energy-red/50 ring-1 ring-energy-red/20 bg-energy-red/5",
    amber: "text-slate-900 dark:text-slate-100 border-energy-amber/50 ring-1 ring-energy-amber/20 bg-energy-amber/5",
  }
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`rounded-xl p-3 text-center border ${colorMap[color]}`}
    >
      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
        {label}
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{note}</div>
    </motion.div>
  )
}

export function AccuracyPanel({ accuracy }: AccuracyPanelProps) {
  const biasSign = accuracy.biasMw >= 0 ? "+" : ""
  return (
    <div className="border rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Forecast accuracy</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {accuracy.matchedIntervals} matched intervals
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stat("MAE", `${accuracy.maeMw.toFixed(1)} MW`, "avg |error|", "slate")}
        {stat("RMSE", `${accuracy.rmseMw.toFixed(1)} MW`, "penalises large errors", "slate")}
        {stat("Bias", `${biasSign}${accuracy.biasMw.toFixed(1)} MW`, "forecast − actual", accuracy.biasMw >= 0 ? "red" : "green")}
        {stat("MAPE", accuracy.mapePercent == null ? "n/a" : `${accuracy.mapePercent.toFixed(1)}%`, "zero-actuals excluded", "amber")}
      </div>
    </div>
  )
}
