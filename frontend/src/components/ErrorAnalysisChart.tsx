import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { IntervalPoint } from "@/services/api"

interface ErrorAnalysisChartProps {
  points: IntervalPoint[]
}

export function ErrorAnalysisChart({ points }: ErrorAnalysisChartProps) {
  const matched = points.filter((p) => p.matched)

  if (matched.length === 0) {
    return null
  }

  const formatTick = (value: number) => {
    const d = new Date(value)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  const showCount = Math.min(matched.length, 40)
  const sample = matched.slice(0, showCount)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Interval-level error (forecast − actual)
        </h3>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Showing {showCount} intervals
        </p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={sample} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="slate-200" vertical={false} />
          <XAxis
            dataKey="startTime"
            tickFormatter={formatTick}
            stroke="slate-500"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "slate-500" }}
          />
          <YAxis stroke="slate-500" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "slate-500" }} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            labelFormatter={(label: any) => new Date(label).toLocaleString()}
          />
          <Bar
            dataKey="errorMw"
            radius={[2, 2, 0, 0]}
            fill="slate-600"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
