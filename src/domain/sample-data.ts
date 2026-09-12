import type {
  ActivityEvent,
  Booking,
  BookingStatus,
  BusinessSettings,
  Client,
  NexaBookData,
  Service,
  TeamMember,
  WeeklyAvailability,
} from "@/domain/types";

export const DEMO_SEED = "nexabook-foundation-v1";
export const DEMO_NOW = "2026-09-10T15:15:00.000Z";

export function demoTimestamp() {
  return DEMO_NOW;
}

const firstNames = [
  "Emma",
  "James",
  "Olivia",
  "Liam",
  "Isabella",
  "Ethan",
  "Mia",
  "Noah",
  "Sophia",
  "Lucas",
  "Ava",
  "Mateo",
] as const;
const lastNames = [
  "Wilson",
  "Carter",
  "Brown",
  "Taylor",
  "Moore",
  "Davis",
  "Anderson",
  "Clark",
] as const;

const serviceTemplates = [
  ["Facial Treatment", "Skincare", 60, 120, "#6366f1"],
  ["Deep Tissue Massage", "Massage", 60, 110, "#8b5cf6"],
  ["Hair Cut & Style", "Hair", 45, 80, "#0ea5e9"],
  ["Hair Color", "Hair", 90, 150, "#f59e0b"],
  ["Consultation", "Consultation", 30, 50, "#14b8a6"],
  ["Hydrating Facial", "Skincare", 45, 95, "#ec4899"],
] as const;

const teamTemplates = [
  ["Ava", "Martinez", "Esthetician"],
  ["Noah", "Kim", "Massage Therapist"],
  ["Sophia", "Lee", "Hair Stylist"],
  ["Michael", "Chen", "Clinic Director"],
  ["Maya", "Patel", "Wellness Coach"],
] as const;

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: string) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function isoAt(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date(DEMO_NOW);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  // September demo dates use Toronto's UTC−4 offset while preserving deterministic ISO values.
  date.setUTCHours(hour + 4, minute, 0, 0);
  return date.toISOString();
}

function weekdayAvailability(): WeeklyAvailability {
  const fullDay = [{ start: "09:00", end: "17:30" }];
  return {
    monday: fullDay,
    tuesday: fullDay,
    wednesday: fullDay,
    thursday: fullDay,
    friday: fullDay,
    saturday: [{ start: "09:00", end: "14:00" }],
    sunday: [],
  };
}

function generateServices(): Service[] {
  return serviceTemplates.map(
    ([name, category, durationMinutes, price, color], index) => ({
      id: `service-${String(index + 1).padStart(3, "0")}`,
      name,
      description: `${name} tailored to the client's goals and comfort.`,
      category,
      durationMinutes,
      bufferMinutes: 15,
      price,
      currency: "USD",
      status: "active",
      color,
      createdAt: isoAt(-120 + index, 9),
      updatedAt: isoAt(-8 + index, 12),
    }),
  );
}

function generateTeamMembers(services: Service[]): TeamMember[] {
  return teamTemplates.map(([firstName, lastName, title], index) => ({
    id: `team-${String(index + 1).padStart(3, "0")}`,
    firstName,
    lastName,
    email: `${firstName}.${lastName}@lunawellness.example`.toLowerCase(),
    phone: `+1 416 555 ${String(1400 + index).padStart(4, "0")}`,
    role: index === 3 ? "manager" : "specialist",
    title,
    bio: `${title} focused on thoughtful, personal service.`,
    status: index === 4 ? "away" : "active",
    serviceIds: services
      .filter(
        (_, serviceIndex) => (serviceIndex + index) % 2 === 0 || index === 3,
      )
      .map((service) => service.id),
    avatarUrl: null,
    availability: weekdayAvailability(),
    createdAt: isoAt(-210 + index, 9),
    updatedAt: isoAt(-12 + index, 11),
  }));
}

function generateClients(): Client[] {
  return Array.from({ length: 300 }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[(index * 3) % lastNames.length];
    const status =
      index < 284 ? "active" : index < 292 ? "inactive" : "prospect";
    return {
      id: `client-${String(index + 1).padStart(3, "0")}`,
      firstName,
      lastName,
      email: `${firstName}.${lastName}${index + 1}@example.com`.toLowerCase(),
      phone: `+1 647 555 ${String(2100 + index).padStart(4, "0")}`,
      status,
      preferredContact:
        index % 3 === 0 ? "sms" : index % 3 === 1 ? "email" : "phone",
      tags:
        index % 5 === 0
          ? ["VIP", "Referral"]
          : index % 3 === 0
            ? ["Regular"]
            : [],
      notes: index % 4 === 0 ? "Prefers morning appointments." : "",
      createdAt: isoAt(-(30 + index * 5), 9),
      updatedAt: isoAt(-(index % 14), 14),
    };
  });
}

function generateBookings(
  random: () => number,
  clients: Client[],
  services: Service[],
  teamMembers: TeamMember[],
): Booking[] {
  const todayServices = [3, 3, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2] as const;
  const todayTimes = [
    [9, 0],
    [9, 30],
    [10, 0],
    [10, 30],
    [11, 0],
    [11, 30],
    [12, 0],
    [12, 30],
    [13, 0],
    [13, 30],
    [14, 30],
    [15, 30],
  ] as const;
  const upcomingStatuses: BookingStatus[] = [
    "confirmed",
    "confirmed",
    "pending",
    "confirmed",
  ];

  return Array.from({ length: 48 }, (_, index) => {
    const client = clients[index % clients.length];
    const historicalIndex = Math.max(0, index - 12);
    const dayOffset =
      index < 12
        ? 0
        : index < 36
          ? -(1 + (historicalIndex % 6))
          : 1 + ((index - 36) % 6);
    const serviceIndex =
      index < 12 ? todayServices[index] : (index * 5) % services.length;
    const service = services[serviceIndex];
    const teamMember = teamMembers[(index * 2) % teamMembers.length];
    const [hour, minute] =
      index < 12
        ? todayTimes[index]
        : [9 + (index % 8), index % 2 === 0 ? 0 : 30];
    const startsAt = isoAt(dayOffset, hour, minute);
    const endsAt = new Date(
      new Date(startsAt).getTime() + service.durationMinutes * 60_000,
    ).toISOString();
    const status: BookingStatus =
      dayOffset < 0
        ? "completed"
        : dayOffset > 0
          ? upcomingStatuses[index % upcomingStatuses.length]
          : index < 4
            ? "completed"
            : index === 4
              ? "in_progress"
              : upcomingStatuses[index % upcomingStatuses.length];
    return {
      id: `booking-${String(index + 1).padStart(3, "0")}`,
      clientId: client.id,
      serviceId: service.id,
      teamMemberId: teamMember.id,
      startsAt,
      endsAt,
      status,
      paymentStatus:
        status === "completed" ? "paid" : random() > 0.7 ? "partial" : "unpaid",
      source: index % 4 === 0 ? "phone" : index % 7 === 0 ? "staff" : "online",
      price: service.price,
      currency: service.currency,
      notes: index % 9 === 0 ? "First visit—allow time for consultation." : "",
      createdAt: isoAt(-18 + (index % 12), 8),
      updatedAt: isoAt(-4 + (index % 5), 13),
    };
  });
}

function generateActivity(
  bookings: Booking[],
  clients: Client[],
): ActivityEvent[] {
  return Array.from({ length: 20 }, (_, index) => {
    const isBooking = index % 3 !== 0;
    const booking = bookings[index % bookings.length];
    const client = clients[index % clients.length];
    const daysAgo = index % 8;
    const sameDaySequence = Math.floor(index / 8);
    const occurredAt = isoAt(
      -daysAgo,
      daysAgo === 0 ? 11 - sameDaySequence : 16 - (index % 7),
    );
    return {
      id: `activity-${String(index + 1).padStart(3, "0")}`,
      kind: isBooking ? "booking_updated" : "client_created",
      entityType: isBooking ? "booking" : "client",
      entityId: isBooking ? booking.id : client.id,
      actorId:
        index % 4 === 0
          ? null
          : `team-${String((index % 5) + 1).padStart(3, "0")}`,
      title: isBooking ? "Booking updated" : "Client added",
      description: isBooking
        ? `Appointment status changed to ${booking.status.replace("_", " ")}.`
        : `${client.firstName} ${client.lastName} joined the client list.`,
      occurredAt,
      metadata: { source: isBooking ? booking.source : "staff" },
      createdAt: occurredAt,
      updatedAt: occurredAt,
    };
  });
}

function generateBusinessSettings(): BusinessSettings {
  return {
    id: "business-settings",
    businessName: "Luna Wellness",
    legalName: "Luna Wellness Studio Inc.",
    email: "hello@lunawellness.example",
    phone: "+1 416 555 0100",
    website: "https://lunawellness.example",
    timezone: "America/Toronto",
    locale: "en-CA",
    currency: "USD",
    weekStartsOn: 1,
    bookingWindowDays: 60,
    cancellationPolicyHours: 24,
    address: {
      line1: "128 Queen Street West",
      line2: "Suite 400",
      city: "Toronto",
      region: "ON",
      postalCode: "M5H 2N2",
      country: "CA",
    },
    businessHours: weekdayAvailability(),
    createdAt: isoAt(-365, 9),
    updatedAt: isoAt(-2, 15),
  };
}

export function generateSampleData(seed = DEMO_SEED): NexaBookData {
  const random = createRandom(seed);
  const services = generateServices();
  const teamMembers = generateTeamMembers(services);
  const clients = generateClients();
  const bookings = generateBookings(random, clients, services, teamMembers);

  return {
    clients,
    bookings,
    services,
    teamMembers,
    activityEvents: generateActivity(bookings, clients),
    businessSettings: generateBusinessSettings(),
  };
}
