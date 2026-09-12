import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  Check,
  Clock3,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/brand-mark";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: CalendarCheck2,
    eyebrow: "Bookings",
    title: "A schedule that stays in sync.",
    copy: "Guide clients from availability to confirmation while your team sees every change immediately.",
    accent: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: UserRoundCheck,
    eyebrow: "Clients",
    title: "Remember the person, not just the appointment.",
    copy: "Keep preferences, notes, and booking history close enough to make every visit feel considered.",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    icon: UsersRound,
    eyebrow: "Team",
    title: "Give everyone a clearer day.",
    copy: "Match services to the right people and keep working hours and availability easy to understand.",
    accent: "bg-sky-50 text-sky-600",
  },
  {
    icon: BarChart3,
    eyebrow: "Business insights",
    title: "See what needs your attention.",
    copy: "Turn daily activity into a concise view of demand, booking value, and the services clients return for.",
    accent: "bg-emerald-50 text-emerald-600",
  },
] as const;

export function LandingPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="overflow-hidden outline-none"
    >
      <div className="relative border-b bg-[radial-gradient(circle_at_72%_8%,rgb(99_102_241/0.13),transparent_31rem),linear-gradient(180deg,#fbfbff_0%,#f6f7fc_100%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#818cf8,transparent)] opacity-60" />
        <MarketingHeader />

        <section className="mx-auto grid max-w-[90rem] items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[minmax(0,0.82fr)_minmax(34rem,1.18fr)] lg:gap-10 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="relative z-10 max-w-2xl">
            <Badge
              variant="brand"
              className="h-8 border-indigo-200/80 bg-white/75 px-3 shadow-[0_6px_20px_-16px_rgb(79_70_229/0.7)]"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              Bookings <span aria-hidden="true">•</span> Clients{" "}
              <span aria-hidden="true">•</span> Team{" "}
              <span aria-hidden="true">•</span> Growth
            </Badge>
            <h1 className="mt-7 text-[clamp(3rem,6vw,5.15rem)] font-bold leading-[0.96] tracking-[-0.062em] text-foreground">
              More bookings.
              <br />
              Happier clients.
              <br />
              <span className="bg-[linear-gradient(105deg,#4338ca_5%,#6366f1_48%,#7c3aed_92%)] bg-clip-text text-transparent">
                A growing business.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              NexaBook brings bookings, clients, services and your team together
              so you can spend less time managing and more time growing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-36">
                <Link href="/demo/login">
                  Try Demo <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-36 bg-white/70"
              >
                <Link href="#product">Explore Product</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden="true" /> No
                setup required
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden="true" />{" "}
                Real interactive demo
              </span>
            </div>
          </div>

          <ProductPreview />
        </section>
      </div>

      <section
        id="product"
        className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28 lg:px-10"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            One calm place to run the day
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">
            Built around the way service businesses actually work.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Each part of NexaBook shares the same information, so the team
            spends less time reconciling tools and more time serving clients.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <Card
              key={benefit.eyebrow}
              className="group relative overflow-hidden p-6 transition-[border-color,box-shadow] duration-150 hover:border-indigo-200 hover:shadow-[0_20px_50px_-40px_rgb(79_70_229/0.55)] sm:p-8"
            >
              <div className="flex items-start gap-5">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${benefit.accent}`}
                >
                  <benefit.icon
                    className="size-5"
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                    {benefit.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-bold tracking-[-0.025em] sm:text-2xl">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {benefit.copy}
                  </p>
                </div>
              </div>
              <span
                className="absolute inset-x-8 bottom-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,#4f46e5,#8b5cf6,transparent)] transition-transform duration-150 group-hover:scale-x-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Card>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-indigo-200/80 bg-[#171a3f] px-6 py-12 text-white shadow-[0_28px_70px_-45px_rgb(30_27_75/0.85)] sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div
            className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-violet-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
              See NexaBook in motion
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Start with a workspace that already feels lived in.
            </h2>
            <p className="mt-4 leading-7 text-indigo-100/80">
              Explore real sample bookings, clients, schedules, and
              services—then make the demo your own.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="relative mt-8 border-white bg-white text-indigo-700 shadow-none hover:border-indigo-50 hover:bg-indigo-50 lg:mt-0"
          >
            <Link href="/demo/login">
              Open the demo <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Brand />
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link
              href="/book/luna-wellness"
              className="rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25"
            >
              Book with Luna Wellness
            </Link>
            <Link
              href="/demo/login"
              className="rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25"
            >
              Demo login
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            A portfolio SaaS experience.
          </p>
        </div>
      </footer>
    </main>
  );
}

function MarketingHeader() {
  return (
    <header className="relative z-20 mx-auto flex h-20 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
      <Link
        href="/"
        aria-label="NexaBook home"
        className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
      >
        <Brand />
      </Link>
      <nav
        aria-label="Marketing navigation"
        className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex"
      >
        <Link
          href="#product"
          className="rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25"
        >
          Product
        </Link>
        <Link
          href="/book/luna-wellness"
          className="rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25"
        >
          Book Luna Wellness
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="/demo/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/demo/login">Try Demo</Link>
        </Button>
      </div>
    </header>
  );
}

function ProductPreview() {
  const bars = [22, 34, 29, 52, 39, 68, 48, 78, 58, 87, 66, 92];
  return (
    <div
      className="relative mx-auto w-full max-w-[49rem] pb-12 lg:translate-x-8"
      aria-label="Preview of the NexaBook workspace"
    >
      <div
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-indigo-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_30px_80px_-38px_rgb(43_46_105/0.48)] ring-1 ring-indigo-950/5">
        <div className="flex h-10 items-center gap-1.5 border-b bg-[#fbfbfe] px-4">
          <span className="size-2 rounded-full bg-rose-300" />
          <span className="size-2 rounded-full bg-amber-300" />
          <span className="size-2 rounded-full bg-emerald-300" />
          <span className="ml-4 h-5 w-40 rounded-md bg-muted" />
        </div>
        <div className="grid min-h-[29rem] grid-cols-[7.5rem_minmax(0,1fr)] sm:min-h-[32rem] sm:grid-cols-[9rem_minmax(0,1fr)]">
          <aside
            className="border-r bg-[#fbfbfe] p-3 sm:p-4"
            aria-hidden="true"
          >
            <Brand compact />
            <div className="mt-7 space-y-2">
              {[
                "Overview",
                "Bookings",
                "Calendar",
                "Clients",
                "Team",
                "Services",
              ].map((label, index) => (
                <div
                  key={label}
                  className={`flex h-8 items-center gap-2 rounded-lg px-2 text-[9px] font-semibold sm:text-[10px] ${index === 0 ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground"}`}
                >
                  <span
                    className={`size-2 rounded-sm ${index === 0 ? "bg-indigo-500" : "bg-slate-300"}`}
                  />{" "}
                  {label}
                </div>
              ))}
            </div>
          </aside>
          <div className="min-w-0 bg-background/70 p-3 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold sm:text-sm">
                  Good morning, Sarah!
                </p>
                <p className="mt-1 text-[7px] text-muted-foreground sm:text-[9px]">
                  Here’s what’s happening at Luna Wellness today.
                </p>
              </div>
              <span className="rounded-md border bg-white px-2 py-1 text-[7px] font-semibold text-muted-foreground sm:text-[8px]">
                Sep 10
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Bookings", "12"],
                ["Booking value", "$1,240"],
                ["Clients", "284"],
                ["Team", "5"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className="rounded-lg border bg-white p-2.5 sm:p-3"
                >
                  <div className="flex justify-between gap-1">
                    <p className="text-[7px] font-semibold text-muted-foreground sm:text-[8px]">
                      {label}
                    </p>
                    <span
                      className={`size-4 rounded-md ${["bg-emerald-50", "bg-indigo-50", "bg-violet-50", "bg-sky-50"][index]}`}
                    />
                  </div>
                  <p className="mt-2 text-sm font-bold tracking-tight sm:text-base">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1.35fr_0.85fr]">
              <div className="rounded-lg border bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-bold sm:text-[10px]">
                    Booking value
                  </p>
                  <span className="text-[7px] text-muted-foreground">
                    Last 12 days
                  </span>
                </div>
                <div className="mt-4 flex h-24 items-end gap-1.5 sm:h-32 sm:gap-2">
                  {bars.map((height, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-t-sm bg-[linear-gradient(180deg,#6366f1,#a5b4fc)]"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="hidden rounded-lg border bg-white p-4 sm:block">
                <p className="text-[10px] font-bold">Bookings by service</p>
                <div className="mx-auto mt-5 grid size-24 place-items-center rounded-full bg-[conic-gradient(#4f46e5_0_36%,#8b5cf6_36%_62%,#38bdf8_62%_82%,#e2e8f0_82%)]">
                  <div className="grid size-14 place-items-center rounded-full bg-white text-center">
                    <span className="text-sm font-bold leading-none">
                      176
                      <small className="mt-1 block text-[6px] font-medium text-muted-foreground">
                        bookings
                      </small>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 rounded-lg border bg-white p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-[8px] font-bold sm:text-[10px]">
                  Upcoming appointments
                </p>
                <span className="text-[7px] font-semibold text-primary">
                  View all
                </span>
              </div>
              <div className="mt-2 divide-y">
                {[
                  ["9:00", "Emma Wilson", "Facial Treatment"],
                  ["10:30", "James Carter", "Sports Massage"],
                  ["12:00", "Olivia Brown", "Hair Cut & Style"],
                ].map(([time, name, service]) => (
                  <div
                    key={time}
                    className="flex items-center gap-2 py-2 text-[7px] sm:text-[8px]"
                  >
                    <span className="w-7 font-semibold">{time}</span>
                    <Avatar
                      name={name}
                      size="sm"
                      className="size-5 text-[6px]"
                    />
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {name}
                    </span>
                    <span className="hidden text-muted-foreground sm:block">
                      {service}
                    </span>
                    <StatusBadge
                      status="confirmed"
                      className="hidden scale-75 sm:inline-flex"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-1 left-3 flex w-[min(18rem,76%)] items-center gap-3 rounded-xl border border-indigo-100 bg-white p-3 shadow-float sm:-left-8 sm:p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
          <CalendarCheck2 className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold">New booking confirmed</p>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            Facial Treatment · Today, 2:30 PM
          </p>
        </div>
        <Check className="size-4 text-success" aria-hidden="true" />
      </div>
      <div className="absolute -right-2 top-16 hidden w-44 rounded-xl border bg-white p-3 shadow-float sm:block">
        <div className="flex items-center gap-2">
          <Avatar name="Emma Wilson" size="sm" />
          <div>
            <p className="text-[10px] font-bold">Emma Wilson</p>
            <p className="text-[8px] text-muted-foreground">
              Next visit in 2 days
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-50 px-2.5 py-2 text-[8px] font-semibold text-indigo-700">
          <Clock3 className="size-3" aria-hidden="true" /> 4 visits this year
        </div>
      </div>
    </div>
  );
}
