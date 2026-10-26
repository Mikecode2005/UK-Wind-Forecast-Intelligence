import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { IntervalPoint } from "@/types/api"

interface ErrorAnalysisChartProps {
  points: IntervalPoint[]
}

export function ErrorAnalysisChart({ points }: ErrorAnalysisChartProps) {
  const matched = points.filter((p) => p.matched)

  if (matched.length === 0) return null

  const formatTick = (value: string) => {
    const d = new Date(value)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  // Use a denser sample for the difference line so the shape is clear
  const sample =
    matched.length > 200
      ? matched.filter((_, i) => i % Math.ceil(matched.length / 200) === 0)
      : matched

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Forecast error (forecast − actual)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Positive = over-forecast · Negative = under-forecast
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Over
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Under
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={sample} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="startTime"
            tickFormatter={formatTick}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            minTickGap={40}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={55}
            tickFormatter={(v) => `${v >= 0 ? "+" : ""}${Math.round(v)}`}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
            contentStyle={{
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              background: "#fff",
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              fontSize: 12,
            }}
            labelFormatter={(label: string) =>
              new Date(label).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            formatter={(value: number) => [
              `${value >= 0 ? "+" : ""}${value.toFixed(1)} MW`,
              "Error",
            ]}
          />
          <Line
            type="monotone"
            dataKey="errorMw"
            stroke="#2563EB"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
