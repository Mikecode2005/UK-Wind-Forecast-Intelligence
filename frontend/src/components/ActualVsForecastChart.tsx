import {
  LineChart,
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

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Actual vs selected forecast
      </h3>
      {matched.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No matched data available for this period.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={matched}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="slate-200" />
            <XAxis
              dataKey="startTime"
              tickFormatter={formatTick}
              stroke="slate-500"
              axisLine={false}
              tickLine={false}
            />
            <YAxis stroke="slate-500" axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ borderColor: "slate-200" }}
              labelFormatter={(label) =>
                new Date(label as string).toLocaleString()
              }
            />
            <Legend verticalAlign="top" align="right" />
            <Line
              type="monotone"
              dataKey="actualMw"
              stroke="slate-700"
              strokeWidth={2}
              dot={false}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="forecastMw"
              stroke="energy-blue"
              strokeWidth={2}
              dot={false}
              name="Selected forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
