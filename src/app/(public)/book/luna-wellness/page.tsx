import type { Metadata } from "next";

import { PublicBookingPage } from "@/features/public-booking/public-booking-page";

export const metadata: Metadata = {
  title: "Book Luna Wellness",
  description: "Choose a service and reserve an appointment with Luna Wellness.",
};

export default function Page() {
  return <PublicBookingPage />;
}
