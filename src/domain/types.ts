export type EntityId = string;
export type IsoDateTime = string;
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface EntityBase {
  id: EntityId;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export type ClientStatus = "active" | "inactive" | "prospect";
export type ContactPreference = "email" | "phone" | "sms";

export interface Client extends EntityBase {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  preferredContact: ContactPreference;
  tags: string[];
  notes: string;
}

export type ServiceStatus = "active" | "inactive";

export interface Service extends EntityBase {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  bufferMinutes: number;
  price: number;
  currency: string;
  status: ServiceStatus;
  color: string;
}

export type TeamRole = "owner" | "manager" | "specialist" | "receptionist";
export type TeamMemberStatus = "active" | "away" | "inactive";

export interface TimeRange {
  start: string;
  end: string;
}

export type WeeklyAvailability = Record<Weekday, TimeRange[]>;

export interface TeamMember extends EntityBase {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: TeamRole;
  title: string;
  bio: string;
  status: TeamMemberStatus;
  serviceIds: EntityId[];
  avatarUrl: string | null;
  availability: WeeklyAvailability;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type BookingSource = "online" | "phone" | "walk_in" | "staff";

export interface Booking extends EntityBase {
  clientId: EntityId;
  serviceId: EntityId;
  teamMemberId: EntityId;
  startsAt: IsoDateTime;
  endsAt: IsoDateTime;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  source: BookingSource;
  price: number;
  currency: string;
  notes: string;
}

export type ActivityKind =
  | "booking_created"
  | "booking_updated"
  | "booking_cancelled"
  | "client_created"
  | "client_updated"
  | "service_created"
  | "service_updated"
  | "team_member_created"
  | "team_member_updated"
  | "settings_updated";
export type ActivityEntity = "booking" | "client" | "service" | "team_member" | "settings";

export interface ActivityEvent extends EntityBase {
  kind: ActivityKind;
  entityType: ActivityEntity;
  entityId: EntityId;
  actorId: EntityId | null;
  title: string;
  description: string;
  occurredAt: IsoDateTime;
  metadata: Record<string, string | number | boolean | null>;
}

export interface BusinessAddress {
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface BusinessSettings extends EntityBase {
  businessName: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  timezone: string;
  locale: string;
  currency: string;
  weekStartsOn: 0 | 1;
  bookingWindowDays: number;
  cancellationPolicyHours: number;
  address: BusinessAddress;
  businessHours: WeeklyAvailability;
}

export interface NexaBookData {
  clients: Client[];
  bookings: Booking[];
  services: Service[];
  teamMembers: TeamMember[];
  activityEvents: ActivityEvent[];
  businessSettings: BusinessSettings;
}

export type NewEntity<T extends EntityBase> = Omit<T, keyof EntityBase> &
  Partial<Pick<EntityBase, "id" | "createdAt" | "updatedAt">>;
