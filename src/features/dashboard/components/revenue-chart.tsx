import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenuePoint } from "@/features/dashboard/dashboard-data";

const chart = {
  width: 720,
  height: 232,
  left: 54,
  right: 18,
  top: 18,
  bottom: 34,
} as const;

export function RevenueChart({
  data,
  total,
  change,
  formatCurrency,
}: {
  data: RevenuePoint[];
  total: number;
  change: number;
  formatCurrency: (value: number) => string;
}) {
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const ceiling = Math.ceil(maxValue / 250) * 250;
  const points = data.map((point, index) => ({
    ...point,
    x: chart.left + (index / Math.max(1, data.length - 1)) * plotWidth,
    y: chart.top + plotHeight - (point.value / ceiling) * plotHeight,
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? chart.left} ${chart.top + plotHeight} L ${chart.left} ${chart.top + plotHeight} Z`;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle>Booking value overview</CardTitle>
          <div className="mt-2 flex items-baseline gap-2.5">
            <p className="numbers-tabular text-2xl font-bold tracking-[-0.035em]">
              {formatCurrency(total)}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="size-3.5" aria-hidden="true" />
              {change >= 0 ? "+" : ""}
              {change}%<span className="sr-only"> compared with yesterday</span>
            </span>
          </div>
        </div>
        <Badge variant="neutral">Last 7 days</Badge>
      </CardHeader>
      <CardContent className="px-2 pb-3 sm:px-4">
        <div
          className="grid gap-2 px-2 pb-2 sm:hidden"
          role="img"
          aria-label={`Booking value over the last seven days, ending at ${formatCurrency(total)} today.`}
        >
          {data.map((point) => (
            <div
              key={point.key}
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2.5"
            >
              <span className="text-xs font-semibold text-muted-foreground">
                {point.label}
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full min-w-1 rounded-full bg-[linear-gradient(90deg,#818cf8,#5b4fe8)]"
                  style={{
                    width: `${Math.max(2, (point.value / ceiling) * 100)}%`,
                  }}
                />
              </span>
              <span className="numbers-tabular text-xs font-semibold">
                {formatCurrency(point.value)}
              </span>
            </div>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="hidden h-auto w-full overflow-visible sm:block"
          role="img"
          aria-label={`Booking value over the last seven days, ending at ${formatCurrency(total)} today.`}
        >
          <defs>
            <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="revenue-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#5b4fe8" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chart.top + plotHeight - ratio * plotHeight;
            return (
              <g key={ratio}>
                <line
                  x1={chart.left}
                  x2={chart.width - chart.right}
                  y1={y}
                  y2={y}
                  stroke="#e8eaf3"
                  strokeWidth="1"
                />
                <text
                  x={chart.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#7b829d"
                >
                  {formatCurrency(ceiling * ratio).replace(".00", "")}
                </text>
              </g>
            );
          })}
          <path d={areaPath} fill="url(#revenue-area)" />
          <path
            d={linePath}
            fill="none"
            stroke="url(#revenue-line)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point) => (
            <g key={point.key}>
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill="#ffffff"
                opacity="0.9"
              />
              <circle cx={point.x} cy={point.y} r="3.5" fill="#5b4fe8">
                <title>
                  {point.label}: {formatCurrency(point.value)}
                </title>
              </circle>
              <text
                x={point.x}
                y={chart.height - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#707894"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
        <table className="sr-only">
          <caption>Booking value for the last seven days</caption>
          <tbody>
            {data.map((point) => (
              <tr key={point.key}>
                <th>{point.label}</th>
                <td>{formatCurrency(point.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
