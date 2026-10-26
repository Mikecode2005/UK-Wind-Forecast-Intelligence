import { motion } from "framer-motion"
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { IntervalPoint } from "@/types/api"

interface ActualVsForecastChartProps {
  points: IntervalPoint[]
}

export function ActualVsForecastChart({ points }: ActualVsForecastChartProps) {
  const matched = points.filter((p) => p.matched)

  const formatTick = (value: string) => {
    const d = new Date(value)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  if (matched.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">
          Actual vs selected forecast
        </h3>
        <p className="text-sm text-slate-500">No matched data available for this period.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Actual vs selected forecast</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Half-hourly wind generation (MW) · selected D-1 vintage
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-600 rounded" /> Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-brand-600 rounded" /> Selected forecast
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={matched} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#475569" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="startTime"
            tickFormatter={formatTick}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b", fontFamily: "Inter" }}
            minTickGap={40}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b", fontFamily: "Inter" }}
            width={58}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
          />
          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
            contentStyle={{
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              background: "#fff",
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              fontSize: 12,
              fontFamily: "Inter",
            }}
            labelFormatter={(label) => {
              if (label == null) return ""
              const d = new Date(String(label))
              return d.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : Number(value)
              return [`${Number.isFinite(n) ? n.toFixed(1) : "—"} MW`, String(name)]
            }}
          />
          <Legend content={() => null} />
          <Area
            type="monotone"
            dataKey="actualMw"
            stroke="#334155"
            strokeWidth={2.5}
            fill="url(#gradActual)"
            name="Actual"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="forecastMw"
            stroke="#2563EB"
            strokeWidth={2.5}
            strokeDasharray="0"
            dot={false}
            name="Selected forecast"
            activeDot={{ r: 4, strokeWidth: 0, fill: "#2563EB" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
