import { isEffectiveBooking } from "@/domain/booking-derived";
import { DEMO_NOW } from "@/domain/sample-data";
import type {
  ActivityEvent,
  Booking,
  BusinessSettings,
  Client,
  Service,
  TeamMember,
} from "@/domain/types";

const DAY_MS = 86_400_000;

export interface DashboardSource {
  bookings: Booking[];
  clients: Client[];
  services: Service[];
  teamMembers: TeamMember[];
  activityEvents: ActivityEvent[];
  businessSettings: BusinessSettings;
}

export interface DashboardAppointment {
  booking: Booking;
  client: Client;
  service: Service;
  teamMember: TeamMember;
}

export interface RevenuePoint {
  key: string;
  label: string;
  value: number;
}

export interface ServiceBookingPoint {
  id: string;
  name: string;
  color: string;
  count: number;
  percentage: number;
}

function dayKey(value: string | Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function joinAppointment(
  booking: Booking,
  clients: Map<string, Client>,
  services: Map<string, Service>,
  teamMembers: Map<string, TeamMember>,
): DashboardAppointment | null {
  const client = clients.get(booking.clientId);
  const service = services.get(booking.serviceId);
  const teamMember = teamMembers.get(booking.teamMemberId);
  return client && service && teamMember ? { booking, client, service, teamMember } : null;
}

function relativeTime(value: string) {
  const differenceMinutes = Math.max(0, Math.round((new Date(DEMO_NOW).getTime() - new Date(value).getTime()) / 60_000));
  if (differenceMinutes < 1) return "Just now";
  if (differenceMinutes < 60) return `${differenceMinutes}m ago`;
  const hours = Math.floor(differenceMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getDashboardData(source: DashboardSource) {
  const { bookings, clients, services, teamMembers, activityEvents, businessSettings } = source;
  const now = new Date(DEMO_NOW);
  const todayKey = dayKey(now, businessSettings.timezone);
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const serviceMap = new Map(services.map((service) => [service.id, service]));
  const teamMap = new Map(teamMembers.map((member) => [member.id, member]));
  const validBookings = bookings.filter(isEffectiveBooking);
  const todayBookings = validBookings
    .filter((booking) => dayKey(booking.startsAt, businessSettings.timezone) === todayKey)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const completedToday = todayBookings.filter((booking) => booking.status === "completed").length;
  const revenueToday = todayBookings.reduce((total, booking) => total + booking.price, 0);

  const yesterdayDate = new Date(now.getTime() - DAY_MS);
  const yesterdayKey = dayKey(yesterdayDate, businessSettings.timezone);
  const yesterdayRevenue = validBookings
    .filter((booking) => dayKey(booking.startsAt, businessSettings.timezone) === yesterdayKey)
    .reduce((total, booking) => total + booking.price, 0);
  const revenueChange = yesterdayRevenue > 0 ? Math.round(((revenueToday - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;

  const revenueSeries: RevenuePoint[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getTime() - (6 - index) * DAY_MS);
    const key = dayKey(date, businessSettings.timezone);
    const value = validBookings
      .filter((booking) => dayKey(booking.startsAt, businessSettings.timezone) === key)
      .reduce((total, booking) => total + booking.price, 0);
    return {
      key,
      label: new Intl.DateTimeFormat(businessSettings.locale, {
        timeZone: businessSettings.timezone,
        weekday: "short",
      }).format(date),
      value,
    };
  });

  const serviceCounts = new Map<string, number>();
  for (const booking of validBookings) {
    if (new Date(booking.startsAt).getTime() <= now.getTime()) {
      serviceCounts.set(booking.serviceId, (serviceCounts.get(booking.serviceId) ?? 0) + 1);
    }
  }
  const totalServiceBookings = Array.from(serviceCounts.values()).reduce((sum, count) => sum + count, 0);
  const serviceBreakdown: ServiceBookingPoint[] = services
    .map((service) => ({
      id: service.id,
      name: service.name,
      color: service.color,
      count: serviceCounts.get(service.id) ?? 0,
      percentage: totalServiceBookings > 0 ? Math.round(((serviceCounts.get(service.id) ?? 0) / totalServiceBookings) * 100) : 0,
    }))
    .filter((service) => service.count > 0)
    .sort((a, b) => b.count - a.count);

  const upcomingAppointments = validBookings
    .filter(
      (booking) =>
        booking.status !== "completed" &&
        (new Date(booking.startsAt).getTime() >= now.getTime() || booking.status === "in_progress"),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((booking) => joinAppointment(booking, clientMap, serviceMap, teamMap))
    .filter((appointment): appointment is DashboardAppointment => appointment !== null)
    .slice(0, 5);

  const todaySchedule = todayBookings
    .map((booking) => joinAppointment(booking, clientMap, serviceMap, teamMap))
    .filter((appointment): appointment is DashboardAppointment => appointment !== null);

  const recentActivity = activityEvents
    .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 4)
    .map((event) => ({ ...event, relativeTime: relativeTime(event.occurredAt) }));

  return {
    formattedDate: new Intl.DateTimeFormat(businessSettings.locale, {
      timeZone: businessSettings.timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(now),
    todayBookingCount: todayBookings.length,
    completedToday,
    remainingToday: todayBookings.length - completedToday,
    revenueToday,
    revenueChange,
    activeClientCount: clients.filter((client) => client.status === "active").length,
    clientCount: clients.length,
    teamMemberCount: teamMembers.filter((member) => member.status !== "inactive").length,
    availableTeamCount: teamMembers.filter((member) => member.status === "active").length,
    revenueSeries,
    serviceBreakdown,
    totalServiceBookings,
    upcomingAppointments,
    todaySchedule,
    recentActivity,
  };
}
