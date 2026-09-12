"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { demoTimestamp, generateSampleData } from "@/domain/sample-data";
import type {
  ActivityEvent,
  Booking,
  BusinessSettings,
  Client,
  NewEntity,
  NexaBookData,
  Service,
  TeamMember,
} from "@/domain/types";

const STORE_VERSION = 3;
const initialData = generateSampleData();

type EntityName = "client" | "booking" | "service" | "team" | "activity";

export interface NexaBookActions {
  createClient: (input: NewEntity<Client>) => Client;
  updateClient: (
    id: string,
    updates: Partial<Omit<Client, "id" | "createdAt">>,
  ) => void;
  removeClient: (id: string) => void;
  createBooking: (input: NewEntity<Booking>) => Booking;
  updateBooking: (
    id: string,
    updates: Partial<Omit<Booking, "id" | "createdAt">>,
  ) => void;
  removeBooking: (id: string) => void;
  createService: (input: NewEntity<Service>) => Service;
  updateService: (
    id: string,
    updates: Partial<Omit<Service, "id" | "createdAt">>,
  ) => void;
  removeService: (id: string) => void;
  createTeamMember: (input: NewEntity<TeamMember>) => TeamMember;
  updateTeamMember: (
    id: string,
    updates: Partial<Omit<TeamMember, "id" | "createdAt">>,
  ) => void;
  removeTeamMember: (id: string) => void;
  createActivityEvent: (input: NewEntity<ActivityEvent>) => ActivityEvent;
  removeActivityEvent: (id: string) => void;
  updateBusinessSettings: (
    updates: Partial<Omit<BusinessSettings, "id" | "createdAt">>,
  ) => void;
  resetDemoData: () => void;
}

export type NexaBookStore = NexaBookData & NexaBookActions;

function entityId(prefix: EntityName) {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

function createEntity<
  T extends { id: string; createdAt: string; updatedAt: string },
>(prefix: EntityName, input: NewEntity<T>): T {
  const timestamp = demoTimestamp();
  return {
    ...input,
    id: input.id ?? entityId(prefix),
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  } as T;
}

function updateEntity<T extends { id: string; updatedAt: string }>(
  items: T[],
  id: string,
  updates: Partial<Omit<T, "id">>,
) {
  return items.map((item) =>
    item.id === id
      ? { ...item, ...updates, id: item.id, updatedAt: demoTimestamp() }
      : item,
  );
}

function migratePersistedState(persistedState: unknown) {
  if (!persistedState || typeof persistedState !== "object")
    return generateSampleData();
  const state = persistedState as Partial<NexaBookData>;
  if (
    !Array.isArray(state.clients) ||
    !Array.isArray(state.bookings) ||
    !Array.isArray(state.services) ||
    !Array.isArray(state.teamMembers) ||
    !Array.isArray(state.activityEvents) ||
    !state.businessSettings
  ) {
    return generateSampleData();
  }

  const clients = state.clients.map((persistedClient) => {
    const client = { ...persistedClient } as Client & Record<string, unknown>;
    delete client.totalBookings;
    delete client.totalSpent;
    delete client.lastVisitAt;
    return client as Client;
  });

  return { ...state, clients } as NexaBookData;
}

export const useNexaBookStore = create<NexaBookStore>()(
  persist(
    (set) => ({
      ...initialData,
      createClient: (input) => {
        const entity = createEntity<Client>("client", input);
        set((state) => ({ clients: [entity, ...state.clients] }));
        return entity;
      },
      updateClient: (id, updates) =>
        set((state) => ({ clients: updateEntity(state.clients, id, updates) })),
      removeClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((item) => item.id !== id),
          bookings: state.bookings.filter((booking) => booking.clientId !== id),
        })),
      createBooking: (input) => {
        const entity = createEntity<Booking>("booking", input);
        set((state) => ({ bookings: [entity, ...state.bookings] }));
        return entity;
      },
      updateBooking: (id, updates) =>
        set((state) => ({
          bookings: updateEntity(state.bookings, id, updates),
        })),
      removeBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((item) => item.id !== id),
        })),
      createService: (input) => {
        const entity = createEntity<Service>("service", input);
        set((state) => ({ services: [entity, ...state.services] }));
        return entity;
      },
      updateService: (id, updates) =>
        set((state) => ({
          services: updateEntity(state.services, id, updates),
        })),
      removeService: (id) =>
        set((state) => ({
          services: state.bookings.some((booking) => booking.serviceId === id)
            ? state.services.map((service) =>
                service.id === id
                  ? {
                      ...service,
                      status: "inactive",
                      updatedAt: demoTimestamp(),
                    }
                  : service,
              )
            : state.services.filter((item) => item.id !== id),
          teamMembers: state.bookings.some(
            (booking) => booking.serviceId === id,
          )
            ? state.teamMembers
            : state.teamMembers.map((member) =>
                member.serviceIds.includes(id)
                  ? {
                      ...member,
                      serviceIds: member.serviceIds.filter(
                        (serviceId) => serviceId !== id,
                      ),
                      updatedAt: demoTimestamp(),
                    }
                  : member,
              ),
        })),
      createTeamMember: (input) => {
        const entity = createEntity<TeamMember>("team", input);
        set((state) => ({ teamMembers: [entity, ...state.teamMembers] }));
        return entity;
      },
      updateTeamMember: (id, updates) =>
        set((state) => ({
          teamMembers: updateEntity(state.teamMembers, id, updates),
        })),
      removeTeamMember: (id) =>
        set((state) => ({
          teamMembers: state.bookings.some(
            (booking) => booking.teamMemberId === id,
          )
            ? state.teamMembers.map((member) =>
                member.id === id
                  ? {
                      ...member,
                      status: "inactive",
                      updatedAt: demoTimestamp(),
                    }
                  : member,
              )
            : state.teamMembers.filter((item) => item.id !== id),
        })),
      createActivityEvent: (input) => {
        const entity = createEntity<ActivityEvent>("activity", input);
        set((state) => ({ activityEvents: [entity, ...state.activityEvents] }));
        return entity;
      },
      removeActivityEvent: (id) =>
        set((state) => ({
          activityEvents: state.activityEvents.filter((item) => item.id !== id),
        })),
      updateBusinessSettings: (updates) =>
        set((state) => ({
          businessSettings: {
            ...state.businessSettings,
            ...updates,
            id: state.businessSettings.id,
            updatedAt: demoTimestamp(),
          },
          services: updates.currency
            ? state.services.map((service) => ({
                ...service,
                currency: updates.currency!,
                updatedAt: demoTimestamp(),
              }))
            : state.services,
        })),
      resetDemoData: () => set(generateSampleData()),
    }),
    {
      name: "nexabook-app-state",
      version: STORE_VERSION,
      partialize: (state) => ({
        clients: state.clients,
        bookings: state.bookings,
        services: state.services,
        teamMembers: state.teamMembers,
        activityEvents: state.activityEvents,
        businessSettings: state.businessSettings,
      }),
      migrate: migratePersistedState,
    },
  ),
);

if (typeof window !== "undefined") {
  const syncWindow = window as Window & { __nexaBookStorageSync?: boolean };
  if (!syncWindow.__nexaBookStorageSync) {
    window.addEventListener("storage", (event) => {
      if (event.key === "nexabook-app-state")
        void useNexaBookStore.persist.rehydrate();
    });
    syncWindow.__nexaBookStorageSync = true;
  }
}
