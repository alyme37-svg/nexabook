# NexaBook Product Specification

## Product direction

NexaBook is a polished interactive portfolio SaaS demo for modern service businesses. It should feel premium, calm, fast, and credible on both desktop and mobile, including low-end devices.

The supplied visual reference is directional rather than a pixel-perfect specification. Its key cues are a compact sidebar, cool-white surfaces, restrained indigo and violet accents, soft borders, subtle elevation, dense but readable tables, clear status pills, disciplined whitespace, and a polished operational SaaS tone.

## Phase 0 — Foundation

This phase establishes the product foundation only. It must not continue into full feature-page implementation.

### Required stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui patterns where useful
- Lucide icons
- Zustand with local persistence

### Required foundations

- Establish a scalable application architecture and complete visual design system.
- Define `Client`, `Booking`, `Service`, `TeamMember`, `ActivityEvent`, and `BusinessSettings` domain types.
- Provide deterministic generation of realistic sample data.
- Provide a versioned local persisted application store with CRUD actions.
- Build the desktop sidebar, app header, mobile navigation foundation, and page container.
- Build reusable cards, buttons, inputs, status badges, dialog/sheet conventions, table styling, loading states, and empty states.
- Add only minimal route placeholders for Dashboard, Bookings, Clients, Calendar, Team, Services, and other navigation destinations.
- Document concise architecture rules in the repository-level `AGENTS.md`.

### Constraints

- Do not add backend services.
- Do not install unnecessary dependencies.
- Do not build full feature pages in this phase.
- Do not refactor unrelated working code.
- Prioritize architecture, visual consistency, reusable tokens, performance, stability, and clean organization.
- Use subtle motion only, respect reduced-motion preferences, and keep the client bundle lean.
- Run appropriate checks once after implementation, then stop.

## Visual system intent

- Neutral canvas with white working surfaces and a cool indigo undertone.
- Strong navy typography with muted slate supporting text.
- Indigo as the primary action and focus color; violet only as a supporting accent.
- Compact controls and data rows with comfortable mobile touch targets.
- Fine cool-gray borders, medium corner radii, and shadows reserved for floating layers.
- One signature brand detail: a quiet indigo-to-violet edge glow used sparingly on active navigation and primary emphasis.

## Dashboard

The Dashboard is the primary operational overview for Luna Wellness and the most visually important application screen.

It includes:

- A “Good morning, Sarah 👋” greeting and a concise daily summary.
- Bookings Today, Revenue Today, Active Clients, and Team Members metrics.
- A revenue trend visualization and bookings-by-service breakdown.
- Upcoming Appointments, Today’s Schedule, and Recent Activity.

Dashboard values should be derived from the deterministic local demo data where practical. The layout should balance compact information density with clear hierarchy and breathing room, remain responsive, and reuse the established shell and visual tokens without redesigning other routes.

## Bookings

The bookings workspace is the operational source of truth for appointments. It provides search, status tabs, date, service, and team-member filters, a compact responsive booking table, and contextual actions for editing, status changes, cancellation, and deletion. All mutations use the persisted local application store.

## Create Booking Flow

Create and edit bookings through a focused five-step flow: Client, Service, Team Member, Date & Time, and Confirmation. Each step reveals only the information needed for the current decision, supports backward navigation, and clearly summarizes the booking before saving. Time slots are calculated locally from team availability, service duration and buffer, and existing non-cancelled bookings.

## Calendar

The calendar provides Day, Week, and Month views and defaults to Week. It reads directly from the booking store so saved changes appear immediately. Selecting an event reveals its client, service, team member, time, status, payment state, and notes, with a direct edit action. The implementation stays lightweight and uses native layout primitives rather than a large calendar dependency.

## Clients

Clients provides a searchable client directory with create, edit, and delete actions. A client detail view shows contact preferences, notes, booking history, total bookings, and total spend derived from the persisted booking records.

## Team

Team provides a responsive staff directory with member details, status controls, weekly working hours, availability, and assigned services. Create and edit forms update the local store so booking assignment options reflect current staff eligibility immediately.

## Services

Services provides a searchable, filterable service catalogue with create, edit, activate/archive, and delete actions. Each service records category, duration, buffer, price, and assigned team members. Active services become selectable in the booking flow without additional setup.

## Brand

NexaBook is a calm, credible SaaS brand for modern service businesses. Luna Wellness is its public demo business. Both experiences share the NexaBook navy, indigo, violet, cool-white surfaces, and restrained edge-glow signature while allowing Luna Wellness to use softer wellness-focused language and emerald accents.

## Design Direction

Public experiences extend the established product system with more generous spacing and stronger editorial hierarchy. The marketing page uses the software interface itself as the primary visual. Public booking feels customer-facing but retains the same controls, focus states, borders, and accessible interaction patterns. Avoid stock imagery, fake statistics, heavy blur, excessive gradients, and animation-led layouts.

## Marketing Landing Page

The landing page positions NexaBook as a credible unified workspace for bookings, clients, services, teams, and business insight. It includes a direct demo CTA, a product-exploration CTA, a layered preview built from real NexaBook UI patterns, and concise benefit sections without fabricated social proof.

## Demo Login

The demo login at `/demo/login` uses prefilled sample credentials and continues directly into the local Luna Wellness workspace. It does not implement authentication or send credentials to a server.

## Public Booking Page

The Luna Wellness booking page at `/book/luna-wellness` guides a client through Service, Team Member, Date, Time, Basic Client Information, and Confirmation. Availability is derived locally from active services, eligible active team members, working hours, and existing bookings. Confirmed appointments use the shared persisted store and appear immediately in the admin product.

## Settings

Settings manages the Luna Wellness business profile, contact details, address, locale, timezone, currency, calendar week start, booking window, cancellation notice, and default business hours. Saving preferences updates every dependent local view. Reset Demo Data restores the deterministic seed for all entities after explicit confirmation.
