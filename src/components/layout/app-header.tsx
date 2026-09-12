"use client";

import { usePathname } from "next/navigation";

import { Brand } from "@/components/brand-mark";
import { allNavigation } from "@/components/layout/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const current = allNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 supports-[backdrop-filter]:bg-card/90 supports-[backdrop-filter]:backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="lg:hidden">
        <Brand compact />
      </div>
      <p className="hidden text-sm font-semibold sm:block lg:hidden">
        {current?.label ?? "NexaBook"}
      </p>
      <div className="ml-auto flex items-center gap-1.5">
        <div className="ml-1 flex min-h-10 items-center gap-2 rounded-lg px-1.5">
          <span
            className="grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700"
            aria-hidden="true"
          >
            SC
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs font-semibold leading-4">Sarah Chen</p>
            <p className="text-[10px] leading-3 text-muted-foreground">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
