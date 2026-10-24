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
import type { IntervalPoint } from "@/services/api"

interface ActualVsForecastChartProps {
  points: IntervalPoint[]
}

export function ActualVsForecastChart({ points }: ActualVsForecastChartProps) {
  const matched = points.filter((p) => p.matched)

  const formatTick = (value: number) => {
    const d = new Date(value)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  if (matched.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5"
      >
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Actual vs selected forecast
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No matched data available for this period.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5"
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Actual vs selected forecast
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={matched} margin={{ top: 12, right: 24, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="slate-700" stopOpacity={0.35} />
              <stop offset="95%" stopColor="slate-700" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="energy-blue" stopOpacity={0.35} />
              <stop offset="95%" stopColor="energy-blue" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="slate-200" vertical={false} />
          <XAxis
            dataKey="startTime"
            tickFormatter={formatTick}
            stroke="slate-500"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "slate-500" }}
          />
          <YAxis stroke="slate-500" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "slate-500" }} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              borderColor: "slate-200",
              background: "rgba(255, 255, 255, 0.95)",
            }}
            labelFormatter={(label: any) =>
              new Date(label).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            }
          />
          <Legend verticalAlign="top" align="right" />
          <Area
            type="monotone"
            dataKey="actualMw"
            stroke="slate-700"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorActual)"
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="forecastMw"
            stroke="energy-blue"
            strokeWidth={2.5}
            dot={false}
            name="Selected forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
