"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"

interface ChartPoint {
  label: string
  total: number
  count: number
}

interface ReporteVentasChartProps {
  data: ChartPoint[]
}

const chartConfig = {
  total: {
    label: "Ventas",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur-sm shadow-xl px-4 py-3 min-w-35">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <p className="text-lg font-bold text-foreground leading-none">
        ${Number(payload[0].value).toLocaleString("es-AR")}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {payload[0].payload.count} venta{payload[0].payload.count !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

export function ReporteVentasChart({ data }: ReporteVentasChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        No hay datos de ventas en el período seleccionado.
      </p>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.total))
  const maxPoint = data.find((d) => d.total === maxVal)

  return (
    <div className="space-y-2">
      {/* Peak label */}
      {maxPoint && (
        <div className="flex items-center gap-1.5 px-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <span className="text-xs text-muted-foreground">
            Pico: <span className="font-semibold text-foreground">{maxPoint.label}</span>
            {" — "}
            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
              ${maxVal.toLocaleString("es-AR")}
            </span>
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={290}>
        <AreaChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="60%" stopColor="#6366f1" stopOpacity={0.07} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tickFormatter={(v) =>
              v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
            }
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1.5, strokeDasharray: "4 4" }} />

          {/* Reference line at max */}
          {maxPoint && (
            <ReferenceLine
              x={maxPoint.label}
              stroke="#3b82f6"
              strokeOpacity={0.3}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
          )}

          <Area
            type="monotone"
            dataKey="total"
            stroke="url(#lineGrad)"
            strokeWidth={2.5}
            fill="url(#areaGrad)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#3b82f6",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
              filter: "url(#glow)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
