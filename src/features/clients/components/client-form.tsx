"use client";

import { Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { notifySuccess } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Client } from "@/domain/types";
import { demoTimestamp } from "@/domain/sample-data";
import { useNexaBookStore } from "@/store/app-store";

export function ClientForm({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}) {
  const createClient = useNexaBookStore((state) => state.createClient);
  const updateClient = useNexaBookStore((state) => state.updateClient);
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );
  const [firstName, setFirstName] = useState(client?.firstName ?? "");
  const [lastName, setLastName] = useState(client?.lastName ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [status, setStatus] = useState<Client["status"]>(
    client?.status ?? "active",
  );
  const [preference, setPreference] = useState<Client["preferredContact"]>(
    client?.preferredContact ?? "email",
  );
  const [tags, setTags] = useState(client?.tags.join(", ") ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
      preferredContact: preference,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes,
    };
    const saved = client
      ? (updateClient(client.id, data), client)
      : createClient(data);
    createActivityEvent({
      kind: client ? "client_updated" : "client_created",
      entityType: "client",
      entityId: saved.id,
      actorId: "team-004",
      title: client ? "Client updated" : "Client added",
      description: `${data.firstName} ${data.lastName} ${client ? "was updated" : "was added to the client list"}.`,
      occurredAt: demoTimestamp(),
      metadata: { status },
    });
    onOpenChange(false);
    notifySuccess(
      client ? "Client updated" : "Client added",
      `${data.firstName} ${data.lastName} is ready for booking.`,
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(38rem,100vw)] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b px-5 py-5 sm:px-7">
          <SheetTitle>{client ? "Edit client" : "Add client"}</SheetTitle>
          <SheetDescription>
            Keep contact preferences and client notes close to their booking
            history.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={save}
          className="scrollbar-subtle flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <div className="grid gap-5 px-5 py-6 sm:px-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="client-first">
                <Input
                  id="client-first"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  autoFocus
                />
              </Field>
              <Field label="Last name" htmlFor="client-last">
                <Input
                  id="client-last"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </Field>
            </div>
            <Field label="Email address" htmlFor="client-email">
              <Input
                id="client-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            <Field label="Phone number" htmlFor="client-phone">
              <Input
                id="client-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Client status" htmlFor="client-status">
                <Select
                  id="client-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as Client["status"])
                  }
                >
                  <option value="active">Active</option>
                  <option value="prospect">Prospect</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
              <Field label="Preferred contact" htmlFor="client-contact">
                <Select
                  id="client-contact"
                  value={preference}
                  onChange={(event) =>
                    setPreference(
                      event.target.value as Client["preferredContact"],
                    )
                  }
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                </Select>
              </Field>
            </div>
            <Field
              label="Tags"
              htmlFor="client-tags"
              hint="Separate tags with commas."
            >
              <Input
                id="client-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="VIP, Referral"
              />
            </Field>
            <Field label="Notes" htmlFor="client-notes">
              <textarea
                id="client-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Preferences, visit notes, or follow-up details"
                className="w-full resize-none rounded-md border border-input bg-card px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 md:text-sm"
              />
            </Field>
          </div>
          <div className="mt-auto flex justify-end gap-3 border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Save aria-hidden="true" />
              {client ? "Save changes" : "Add client"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
