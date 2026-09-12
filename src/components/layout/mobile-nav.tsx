"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "@/components/brand-mark";
import {
  isActiveRoute,
  primaryNavigation,
  secondaryNavigation,
} from "@/components/layout/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const mobilePrimary = primaryNavigation.slice(0, 4);
const mobileSecondary = [...primaryNavigation.slice(4), ...secondaryNavigation];

export function MobileNav() {
  const pathname = usePathname();
  const moreIsActive = mobileSecondary.some((item) =>
    isActiveRoute(pathname, item.href),
  );

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {mobilePrimary.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/25",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground active:bg-muted",
              )}
            >
              <Icon
                className="size-[18px]"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger asChild>
            <button
              aria-current={moreIsActive ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-semibold outline-none transition-colors active:bg-muted focus-visible:ring-3 focus-visible:ring-ring/25",
                moreIsActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Menu
                className="size-[18px]"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4">
            <SheetHeader className="mb-6">
              <SheetTitle className="sr-only">NexaBook navigation</SheetTitle>
              <Brand />
            </SheetHeader>
            <div className="grid gap-1">
              {mobileSecondary.map((item) => {
                const Icon = item.icon;
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/25",
                        isActiveRoute(pathname, item.href)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-[18px]" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
