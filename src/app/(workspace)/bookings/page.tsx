import type { Metadata } from "next";

import { BookingsPage } from "@/features/bookings/bookings-page";

export const metadata: Metadata = { title: "Bookings" };

export default function Page() {
  return <BookingsPage />;
}
