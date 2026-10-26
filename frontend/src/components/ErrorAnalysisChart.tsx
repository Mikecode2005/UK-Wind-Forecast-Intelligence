import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { IntervalPoint } from "@/types/api"

interface ErrorAnalysisChartProps {
  points: IntervalPoint[]
}

export function ErrorAnalysisChart({ points }: ErrorAnalysisChartProps) {
  const matched = points.filter((p) => p.matched)

  if (matched.length === 0) {
    return null
  }

  const formatTick = (value: string) => {
    const d = new Date(value)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  const showCount = Math.min(matched.length, 48)
  const sample = matched.slice(0, showCount)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Interval-level error (forecast − actual)
        </h3>
        <p className="text-[11px] text-slate-500">Showing {showCount} intervals</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={sample} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="startTime"
            tickFormatter={formatTick}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#64748b" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#64748b" }}
            width={50}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: 12,
            }}
            labelFormatter={(label: string) => new Date(label).toLocaleString()}
          />
          <Bar dataKey="errorMw" radius={[3, 3, 0, 0]}>
            {sample.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={(entry.errorMw ?? 0) >= 0 ? "#EF4444" : "#10B981"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-slate-400 mt-2">
        Red = over-forecast · Green = under-forecast
      </p>
    </motion.div>
  )
}
