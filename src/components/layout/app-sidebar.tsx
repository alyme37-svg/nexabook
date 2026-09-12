"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { Brand } from "@/components/brand-mark";
import { allNavigation, isActiveRoute, primaryNavigation, secondaryNavigation } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";
import { useNexaBookStore } from "@/store/app-store";

const subscribeToClient = () => () => undefined;

function NavigationLink({ item }: { item: (typeof allNavigation)[number] }) {
  const pathname = usePathname();
  const active = isActiveRoute(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/25",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/75 hover:text-foreground",
      )}
    >
      {active ? <span className="absolute inset-y-2 -left-0.5 w-0.5 rounded-full bg-primary shadow-[0_0_10px_rgb(99_102_241/0.7)]" /> : null}
      <Icon className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const ready = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const businessName = useNexaBookStore((state) => state.businessSettings.businessName);
  const displayedName = ready ? businessName : "Luna Wellness";
  const initials = displayedName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 flex-col border-r bg-card px-3 py-4 lg:flex">
      <Link href="/dashboard" className="mx-2 mb-7 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/25">
        <Brand />
        <span className="sr-only">NexaBook dashboard</span>
      </Link>
      <nav aria-label="Primary navigation" className="grid gap-1">
        {primaryNavigation.map((item) => <NavigationLink item={item} key={item.href} />)}
      </nav>
      <nav aria-label="Account navigation" className="mt-auto grid gap-1 border-t pt-3">
        {secondaryNavigation.map((item) => <NavigationLink item={item} key={item.href} />)}
      </nav>
      <div className="mt-3 flex items-center gap-3 rounded-xl border bg-muted/35 p-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-[linear-gradient(135deg,#3730a3,#7c3aed)] text-xs font-bold text-white" aria-hidden="true">{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{displayedName}</p>
          <p className="truncate text-[11px] text-muted-foreground">Sarah Chen · Owner</p>
        </div>
      </div>
    </aside>
  );
}
