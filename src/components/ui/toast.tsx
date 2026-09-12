"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

type ToastDetail = {
  title: string;
  description?: string;
};

const toastEvent = "nexabook:toast";

export function notifySuccess(title: string, description?: string) {
  window.dispatchEvent(
    new CustomEvent<ToastDetail>(toastEvent, {
      detail: { title, description },
    }),
  );
}

export function Toaster() {
  const [toast, setToast] = useState<(ToastDetail & { id: number }) | null>(
    null,
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    function show(event: Event) {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      setToast({ ...detail, id: Date.now() });
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setToast(null), 4200);
    }
    window.addEventListener(toastEvent, show);
    return () => {
      window.removeEventListener(toastEvent, show);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 top-4 z-[100] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-card p-4 shadow-float animate-[toast-in_220ms_cubic-bezier(0.2,0.8,0.2,1)] sm:inset-x-auto sm:right-5 sm:top-5 sm:mx-0"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-success">
        <CheckCircle2 className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            {toast.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => setToast(null)}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
