import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <AppSidebar />
      <div className="min-w-0">
        <AppHeader />
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom))] outline-none lg:pb-0"
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
