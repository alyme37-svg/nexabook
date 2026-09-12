import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative block size-8 shrink-0 overflow-hidden rounded-[0.65rem] bg-indigo-50 shadow-[inset_0_0_0_1px_rgb(99_102_241/0.12)]",
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute left-[7px] top-[5px] h-[22px] w-[7px] -rotate-0 rounded-full bg-[linear-gradient(180deg,#4338ca,#6366f1)]" />
      <span className="absolute left-[13px] top-[4px] h-[25px] w-[7px] -rotate-[37deg] rounded-full bg-[linear-gradient(180deg,#7c3aed,#4f46e5)]" />
      <span className="absolute right-[6px] top-[5px] h-[22px] w-[7px] rounded-full bg-[linear-gradient(180deg,#8b5cf6,#60a5fa)]" />
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      {compact ? null : (
        <div className="min-w-0">
          <p className="text-[17px] font-bold leading-5 tracking-[-0.035em] text-foreground">NexaBook</p>
          <p className="text-[10px] font-medium leading-4 tracking-wide text-muted-foreground">Book. Manage. Grow.</p>
        </div>
      )}
    </div>
  );
}
