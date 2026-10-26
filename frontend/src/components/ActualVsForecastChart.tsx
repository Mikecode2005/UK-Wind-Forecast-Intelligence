import { motion } from "framer-motion"
import {
  AreaChart,
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
      >
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Actual vs selected forecast
        </h3>
        <p className="text-sm text-slate-500">
          No matched data available for this period.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl shadow-card p-5"
    >
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Actual vs selected forecast
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={matched} margin={{ top: 12, right: 24, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="startTime"
            tickFormatter={formatTick}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={55}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8" }}
            contentStyle={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
          />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="actualMw"
            stroke="#475569"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorActual)"
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="forecastMw"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={false}
            name="Selected forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
