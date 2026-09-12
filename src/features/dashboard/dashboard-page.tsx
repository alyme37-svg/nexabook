"use client";

import {
  CalendarCheck2,
  CalendarDays,
  CircleDollarSign,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { useNexaBookStore } from "@/store/app-store";
import {
  RecentActivity,
  TodaySchedule,
  UpcomingAppointments,
} from "@/features/dashboard/components/dashboard-panels";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { ServiceBreakdown } from "@/features/dashboard/components/service-breakdown";
import { getDashboardData } from "@/features/dashboard/dashboard-data";

const subscribeToClient = () => () => undefined;

function DashboardLoadingState() {
  return (
    <PageContainer
      className="space-y-6"
      aria-label="Loading dashboard"
      role="status"
    >
      <div>
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <span className="sr-only">Loading dashboard</span>
    </PageContainer>
  );
}

export function DashboardPage() {
  const isClient = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const bookings = useNexaBookStore((state) => state.bookings);
  const clients = useNexaBookStore((state) => state.clients);
  const services = useNexaBookStore((state) => state.services);
  const teamMembers = useNexaBookStore((state) => state.teamMembers);
  const activityEvents = useNexaBookStore((state) => state.activityEvents);
  const businessSettings = useNexaBookStore((state) => state.businessSettings);

  const dashboard = useMemo(
    () =>
      getDashboardData({
        bookings,
        clients,
        services,
        teamMembers,
        activityEvents,
        businessSettings,
      }),
    [
      activityEvents,
      bookings,
      businessSettings,
      clients,
      services,
      teamMembers,
    ],
  );
  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat(businessSettings.locale, {
        style: "currency",
        currency: businessSettings.currency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 0,
      }).format,
    [businessSettings.currency, businessSettings.locale],
  );
  const activeClientShare =
    dashboard.clientCount > 0
      ? Math.round((dashboard.activeClientCount / dashboard.clientCount) * 100)
      : 0;

  if (!isClient) return <DashboardLoadingState />;

  return (
    <PageContainer className="space-y-5 pb-8 sm:space-y-6">
      <section
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        aria-labelledby="dashboard-heading"
      >
        <div>
          <h1
            id="dashboard-heading"
            className="text-[1.75rem] font-bold leading-tight tracking-[-0.04em] sm:text-[2rem]"
          >
            Good morning, Sarah <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Here&apos;s what&apos;s happening at {businessSettings.businessName}{" "}
            today.
          </p>
        </div>
        <Badge
          variant="neutral"
          className="h-9 gap-2 self-start rounded-lg bg-card px-3 text-foreground shadow-[0_1px_2px_rgb(17_21_47/0.03)] sm:self-auto"
        >
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          <time dateTime="2026-09-10">{dashboard.formattedDate}</time>
        </Badge>
      </section>

      <section
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
        aria-label="Today at a glance"
      >
        <MetricCard
          label="Bookings Today"
          value={dashboard.todayBookingCount.toLocaleString(
            businessSettings.locale,
          )}
          detail={`${dashboard.remainingToday} still ahead today`}
          icon={CalendarCheck2}
          tone="emerald"
        />
        <MetricCard
          label="Booking Value Today"
          value={formatCurrency(dashboard.revenueToday)}
          detail={`${dashboard.revenueChange >= 0 ? "+" : ""}${dashboard.revenueChange}% from yesterday`}
          icon={CircleDollarSign}
          tone="indigo"
        />
        <MetricCard
          label="Active Clients"
          value={dashboard.activeClientCount.toLocaleString(
            businessSettings.locale,
          )}
          detail={`${activeClientShare}% of the client base`}
          icon={UserRoundCheck}
          tone="violet"
        />
        <MetricCard
          label="Team Members"
          value={dashboard.teamMemberCount.toLocaleString(
            businessSettings.locale,
          )}
          detail={`${dashboard.availableTeamCount} available today`}
          icon={UsersRound}
          tone="sky"
        />
      </section>

      <section
        className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]"
        aria-label="Business analytics"
      >
        <RevenueChart
          data={dashboard.revenueSeries}
          total={dashboard.revenueToday}
          change={dashboard.revenueChange}
          formatCurrency={formatCurrency}
        />
        <ServiceBreakdown
          data={dashboard.serviceBreakdown}
          total={dashboard.totalServiceBookings}
        />
      </section>

      <section
        className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]"
        aria-label="Daily operations"
      >
        <UpcomingAppointments
          appointments={dashboard.upcomingAppointments}
          timeZone={businessSettings.timezone}
        />
        <div className="grid gap-5">
          <TodaySchedule
            appointments={dashboard.todaySchedule}
            completed={dashboard.completedToday}
            total={dashboard.todayBookingCount}
            timeZone={businessSettings.timezone}
          />
          <RecentActivity items={dashboard.recentActivity} />
        </div>
      </section>
    </PageContainer>
  );
}
