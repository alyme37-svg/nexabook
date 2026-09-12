import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceBookingPoint } from "@/features/dashboard/dashboard-data";

export function ServiceBreakdown({ data, total }: { data: ServiceBookingPoint[]; total: number }) {
  const segments = data.map((service, index) => ({
    ...service,
    dashOffset: -data.slice(0, index).reduce((sum, previous) => sum + previous.percentage, 0),
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-3">
        <div>
          <CardTitle>Bookings by service</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Completed and active bookings</p>
        </div>
        <Badge variant="neutral">All services</Badge>
      </CardHeader>
      <CardContent className="grid items-center gap-5 sm:grid-cols-[11rem_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[10.5rem_minmax(0,1fr)]">
        <div className="relative mx-auto size-44">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={`${total} total bookings grouped by service`}>
            <circle cx="60" cy="60" r="46" fill="none" stroke="#eef0f7" strokeWidth="15" />
            {segments.map((service) => {
              return (
                <circle
                  key={service.id}
                  cx="60"
                  cy="60"
                  r="46"
                  pathLength="100"
                  fill="none"
                  stroke={service.color}
                  strokeWidth="15"
                  strokeDasharray={`${Math.max(0, service.percentage - 1.2)} ${101.2 - service.percentage}`}
                  strokeDashoffset={service.dashOffset}
                >
                  <title>{service.name}: {service.count} bookings ({service.percentage}%)</title>
                </circle>
              );
            })}
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <strong className="numbers-tabular text-2xl font-bold tracking-[-0.04em]">{total}</strong>
            <span className="text-[10px] font-medium text-muted-foreground">total bookings</span>
          </div>
        </div>
        <ul className="grid min-w-0 gap-2.5" aria-label="Service booking totals">
          {data.map((service) => (
            <li key={service.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs">
              <span className="size-2 rounded-full" style={{ backgroundColor: service.color }} aria-hidden="true" />
              <span className="truncate font-medium text-foreground">{service.name}</span>
              <span className="numbers-tabular text-muted-foreground">{service.percentage}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
