"use client";

import { useState } from "react";

type CookiePreferencesDialogProps = {
  initialAnalytics: boolean;
  initialMarketing: boolean;
  onAcceptAll: () => void;
  onCancel: () => void;
  onEssentialsOnly: () => void;
  onSave: (preferences: { analytics: boolean; marketing: boolean }) => void;
};

export function CookiePreferencesDialog({
  initialAnalytics,
  initialMarketing,
  onAcceptAll,
  onCancel,
  onEssentialsOnly,
  onSave,
}: CookiePreferencesDialogProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [marketing, setMarketing] = useState(initialMarketing);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/20 px-3 py-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-text-primary">
              Cookie preferences
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Required cookies keep ClipStitchr working. You can turn the
              optional cookies on or off below.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
            onClick={onCancel}
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="flex items-start gap-2 rounded-md border border-border bg-surface-elevated p-3 text-sm">
            <input
              type="checkbox"
              checked
              disabled
              className="mt-1 h-4 w-4 accent-accent"
            />
            <span>
              <span className="block font-bold text-text-primary">
                Required
              </span>
              <span className="text-xs leading-5 text-text-secondary">
                Sign-in and security
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 rounded-md border border-border bg-white p-3 text-sm">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.currentTarget.checked)}
              className="mt-1 h-4 w-4 accent-accent"
            />
            <span>
              <span className="block font-bold text-text-primary">
                Analytics
              </span>
              <span className="text-xs leading-5 text-text-secondary">
                Helps us improve the site
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 rounded-md border border-border bg-white p-3 text-sm">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.currentTarget.checked)}
              className="mt-1 h-4 w-4 accent-accent"
            />
            <span>
              <span className="block font-bold text-text-primary">
                Marketing
              </span>
              <span className="text-xs leading-5 text-text-secondary">
                Helps us measure ads
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-dark"
            onClick={onAcceptAll}
          >
            Accept
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-bold text-text-primary transition-colors hover:border-accent"
            onClick={() => onSave({ analytics, marketing })}
          >
            Save preferences
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
            onClick={onEssentialsOnly}
          >
            Essentials only
          </button>
        </div>
      </div>
    </div>
  );
}
