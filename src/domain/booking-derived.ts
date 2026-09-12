import type { Booking } from "@/domain/types";

export function isEffectiveBooking(booking: Booking) {
  return booking.status !== "cancelled" && booking.status !== "no_show";
}

export function getEffectiveBookingValue(bookings: Booking[]) {
  return bookings.reduce(
    (total, booking) => total + (isEffectiveBooking(booking) ? booking.price : 0),
    0,
  );
}
