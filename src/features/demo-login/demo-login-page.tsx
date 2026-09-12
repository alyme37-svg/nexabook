"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Brand, BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";

export function DemoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sarah@nexabook.demo");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [entering, setEntering] = useState(false);

  function enterDemo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEntering(true);
    router.push("/dashboard");
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="grid min-h-dvh outline-none lg:grid-cols-[minmax(26rem,0.82fr)_minmax(34rem,1.18fr)]"
    >
      <section className="relative hidden overflow-hidden bg-[#171a3f] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div
          className="pointer-events-none absolute -left-32 top-1/4 size-96 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-40 bottom-0 size-[30rem] rounded-full bg-violet-500/20 blur-3xl"
          aria-hidden="true"
        />
        <Link
          href="/"
          className="relative w-fit rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-white/40"
          aria-label="Back to NexaBook home"
        >
          <div className="flex items-center gap-2.5">
            <BrandMark className="bg-white/10 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]" />
            <div>
              <p className="text-[17px] font-bold tracking-[-0.035em]">
                NexaBook
              </p>
              <p className="text-[10px] text-indigo-200">Book. Manage. Grow.</p>
            </div>
          </div>
        </Link>

        <div className="relative max-w-lg py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
            Your day, already organized
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-[-0.055em] xl:text-6xl">
            A calmer way to run a growing business.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-indigo-100/75">
            Step into Luna Wellness and explore a complete workspace filled with
            realistic bookings, clients, services, and schedules.
          </p>

          <Card className="mt-10 max-w-md border-white/10 bg-white/[0.07] p-5 text-white shadow-none backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-indigo-200">
                <CalendarCheck2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">Your next appointment</p>
                <p className="mt-1 text-sm text-indigo-100/65">
                  Facial Treatment · 10:00 AM
                </p>
              </div>
              <span className="ml-auto grid size-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
            </div>
          </Card>
        </div>

        <p className="relative text-xs text-indigo-100/55">
          Interactive portfolio demo by Ali Elhussein · All data stays in this
          browser
        </p>
      </section>

      <section className="relative grid place-items-center px-5 py-8 sm:px-8">
        <Link
          href="/"
          className="absolute left-5 top-5 flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25 sm:left-8 sm:top-8"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to website
        </Link>

        <div className="w-full max-w-md pt-16 sm:pt-8">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-[0_24px_70px_-42px_rgb(35_42_84/0.5)] sm:p-9">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#eef2ff,#ede9fe)] ring-1 ring-indigo-100">
              <BrandMark className="size-9" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-[-0.045em]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in to your workspace
            </p>

            <form onSubmit={enterDemo} className="mt-8 space-y-5">
              <Field label="Email address" htmlFor="demo-email">
                <Input
                  id="demo-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field label="Password" htmlFor="demo-password">
                <div className="relative">
                  <Input
                    id="demo-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-1 top-1 grid size-9 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/25"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </Field>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={entering}
              >
                {entering ? "Opening workspace…" : "Continue as Demo User"}
                {entering ? null : <ArrowRight aria-hidden="true" />}
              </Button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-indigo-600"
                aria-hidden="true"
              />
              <p className="text-xs leading-5 text-indigo-900/75">
                <strong className="font-semibold text-indigo-900">
                  Demo credentials are prefilled.
                </strong>{" "}
                No account is created and no information is sent to a server.
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Want the client experience?{" "}
            <Link
              href="/book/luna-wellness"
              className="font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/25"
            >
              Book with Luna Wellness
            </Link>
          </p>
          <p className="mt-3 text-center text-[11px] text-muted-foreground/80">
            NexaBook is a portfolio demo designed &amp; developed by Ali
            Elhussein.
          </p>
        </div>
      </section>
    </main>
  );
}
