"use client";

import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Save,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessSettings } from "@/domain/types";
import { demoTimestamp } from "@/domain/sample-data";
import { BusinessHoursEditor } from "@/features/settings/components/business-hours-editor";
import { useNexaBookStore } from "@/store/app-store";

const subscribeToClient = () => () => undefined;

export function SettingsPage() {
  const ready = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const settings = useNexaBookStore((state) => state.businessSettings);
  const updateBusinessSettings = useNexaBookStore(
    (state) => state.updateBusinessSettings,
  );
  const createActivityEvent = useNexaBookStore(
    (state) => state.createActivityEvent,
  );
  const resetDemoData = useNexaBookStore((state) => state.resetDemoData);
  const [resetOpen, setResetOpen] = useState(false);
  const [notice, setNotice] = useState("");

  function saveSettings(nextSettings: BusinessSettings) {
    updateBusinessSettings(nextSettings);
    createActivityEvent({
      kind: "settings_updated",
      entityType: "settings",
      entityId: settings.id,
      actorId: "team-004",
      title: "Business settings updated",
      description: `${nextSettings.businessName}'s profile and booking preferences were updated.`,
      occurredAt: demoTimestamp(),
      metadata: {
        currency: nextSettings.currency,
        timezone: nextSettings.timezone,
      },
    });
    setNotice("Changes saved");
  }

  function resetData() {
    resetDemoData();
    setNotice("Demo data restored");
  }

  if (!ready) {
    return (
      <PageContainer className="space-y-5">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-[34rem] rounded-xl" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Workspace preferences
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold tracking-[-0.04em] sm:text-[2rem]">
            Settings
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Keep business details, booking rules, and demo data consistent
            everywhere.
          </p>
        </div>
        {notice ? (
          <Badge variant="success" role="status" className="h-8 px-3">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {notice}
          </Badge>
        ) : null}
      </header>

      <SettingsForm
        key={settings.updatedAt}
        settings={settings}
        onSave={saveSettings}
        onReset={() => setResetOpen(true)}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all demo data?"
        description="This removes every local change and restores the original deterministic clients, services, team, bookings, activity, and business settings. This cannot be undone."
        confirmLabel="Reset demo data"
        onConfirm={resetData}
      />
    </PageContainer>
  );
}

function SettingsForm({
  settings,
  onSave,
  onReset,
}: {
  settings: BusinessSettings;
  onSave: (settings: BusinessSettings) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(settings);

  function update<K extends keyof BusinessSettings>(
    key: K,
    value: BusinessSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateAddress(
    key: keyof BusinessSettings["address"],
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      address: { ...current.address, [key]: value },
    }));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
      className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="grid gap-5">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Business profile</CardTitle>
                <CardDescription>
                  Used across the admin workspace and public booking experience.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 sm:pt-6">
            <Field label="Business name" htmlFor="settings-name">
              <Input
                id="settings-name"
                required
                value={draft.businessName}
                onChange={(event) => update("businessName", event.target.value)}
              />
            </Field>
            <Field label="Legal name" htmlFor="settings-legal-name">
              <Input
                id="settings-legal-name"
                required
                value={draft.legalName}
                onChange={(event) => update("legalName", event.target.value)}
              />
            </Field>
            <Field label="Email" htmlFor="settings-email">
              <Input
                id="settings-email"
                type="email"
                required
                value={draft.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </Field>
            <Field label="Phone" htmlFor="settings-phone">
              <Input
                id="settings-phone"
                type="tel"
                required
                value={draft.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>
            <Field
              label="Website"
              htmlFor="settings-website"
              className="sm:col-span-2"
            >
              <Input
                id="settings-website"
                type="url"
                value={draft.website}
                onChange={(event) => update("website", event.target.value)}
              />
            </Field>
            <Field
              label="Address"
              htmlFor="settings-address"
              className="sm:col-span-2"
            >
              <Input
                id="settings-address"
                required
                value={draft.address.line1}
                onChange={(event) => updateAddress("line1", event.target.value)}
              />
            </Field>
            <Field label="Suite or unit" htmlFor="settings-address-2">
              <Input
                id="settings-address-2"
                value={draft.address.line2}
                onChange={(event) => updateAddress("line2", event.target.value)}
              />
            </Field>
            <Field label="City" htmlFor="settings-city">
              <Input
                id="settings-city"
                required
                value={draft.address.city}
                onChange={(event) => updateAddress("city", event.target.value)}
              />
            </Field>
            <Field label="Region" htmlFor="settings-region">
              <Input
                id="settings-region"
                required
                value={draft.address.region}
                onChange={(event) =>
                  updateAddress("region", event.target.value)
                }
              />
            </Field>
            <Field label="Postal code" htmlFor="settings-postal">
              <Input
                id="settings-postal"
                required
                value={draft.address.postalCode}
                onChange={(event) =>
                  updateAddress("postalCode", event.target.value)
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <Clock3 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Business hours</CardTitle>
                <CardDescription>
                  Public booking and availability use these hours as the
                  workspace default.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 sm:pt-6">
            <BusinessHoursEditor
              value={draft.businessHours}
              onChange={(value) => update("businessHours", value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-5">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarClock className="size-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Booking preferences</CardTitle>
                <CardDescription>
                  Formatting and policies shared across the product.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-5 sm:pt-6">
            <Field label="Timezone" htmlFor="settings-timezone">
              <Select
                id="settings-timezone"
                value={draft.timezone}
                onChange={(event) => update("timezone", event.target.value)}
              >
                <option value="America/Toronto">Toronto (Eastern)</option>
                <option value="America/New_York">New York (Eastern)</option>
                <option value="America/Los_Angeles">
                  Los Angeles (Pacific)
                </option>
                <option value="Europe/London">London</option>
              </Select>
            </Field>
            <Field label="Locale" htmlFor="settings-locale">
              <Select
                id="settings-locale"
                value={draft.locale}
                onChange={(event) => update("locale", event.target.value)}
              >
                <option value="en-CA">English (Canada)</option>
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
              </Select>
            </Field>
            <Field
              label="Currency"
              htmlFor="settings-currency"
              hint="Applies to services and future bookings; existing booking records keep their original currency."
            >
              <Select
                id="settings-currency"
                value={draft.currency}
                onChange={(event) => update("currency", event.target.value)}
              >
                <option value="USD">USD — US dollar</option>
                <option value="CAD">CAD — Canadian dollar</option>
                <option value="GBP">GBP — British pound</option>
                <option value="EUR">EUR — Euro</option>
              </Select>
            </Field>
            <Field label="Week starts on" htmlFor="settings-week-start">
              <Select
                id="settings-week-start"
                value={draft.weekStartsOn}
                onChange={(event) =>
                  update("weekStartsOn", Number(event.target.value) as 0 | 1)
                }
              >
                <option value={1}>Monday</option>
                <option value={0}>Sunday</option>
              </Select>
            </Field>
            <Field
              label="Booking window"
              htmlFor="settings-window"
              hint="How far ahead clients can book."
            >
              <Input
                id="settings-window"
                type="number"
                min={1}
                max={365}
                required
                value={draft.bookingWindowDays}
                onChange={(event) =>
                  update("bookingWindowDays", Number(event.target.value))
                }
              />
            </Field>
            <Field
              label="Cancellation notice"
              htmlFor="settings-cancellation"
              hint="Hours before an appointment."
            >
              <Input
                id="settings-cancellation"
                type="number"
                min={0}
                max={168}
                required
                value={draft.cancellationPolicyHours}
                onChange={(event) =>
                  update("cancellationPolicyHours", Number(event.target.value))
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          <Save aria-hidden="true" />
          Save changes
        </Button>

        <Card className="border-rose-200/80">
          <CardHeader>
            <CardTitle>Reset demo workspace</CardTitle>
            <CardDescription>
              Restore the exact deterministic sample state and remove every
              local change.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full border-rose-200 text-destructive hover:bg-rose-50"
              onClick={onReset}
            >
              <RotateCcw aria-hidden="true" />
              Reset demo data
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
