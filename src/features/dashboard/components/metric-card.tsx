import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
} as const;

export interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: keyof typeof tones;
}

export function MetricCard({ label, value, detail, icon: Icon, tone }: MetricCardProps) {
  return (
    <Card className="group relative overflow-hidden p-4 transition-[border-color,box-shadow] duration-150 hover:border-indigo-200 hover:shadow-[0_10px_30px_-24px_rgb(79_70_229/0.75)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">{label}</p>
          <p className="numbers-tabular mt-2 text-[1.7rem] font-bold leading-none tracking-[-0.04em] text-foreground">
            {value}
          </p>
        </div>
        <div className={cn("grid size-9 shrink-0 place-items-center rounded-lg ring-1", tones[tone])}>
          <Icon className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 truncate text-[11px] font-medium text-muted-foreground">{detail}</p>
      <span className="absolute inset-x-4 bottom-0 h-px scale-x-0 bg-[linear-gradient(90deg,#4f46e5,#8b5cf6,transparent)] transition-transform duration-150 group-hover:scale-x-100 motion-reduce:transition-none" aria-hidden="true" />
    </Card>
  );
}
