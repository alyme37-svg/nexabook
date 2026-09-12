import type { Metadata } from "next";

import { LandingPage } from "@/features/marketing/landing-page";

export const metadata: Metadata = {
  title: "NexaBook — Book more. Manage less.",
  description:
    "Bookings, clients, services, and your team—together in one calm workspace for modern service businesses.",
};

export default function HomePage() {
  return <LandingPage />;
}
