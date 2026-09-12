import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5" aria-label="Loading content" role="status">
      <Skeleton className="mb-4 h-4 w-28" />
      <Skeleton className="mb-2 h-7 w-40" />
      <Skeleton className="h-4 w-3/4" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
