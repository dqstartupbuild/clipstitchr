"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useStudioBetaAccess } from "@/lib/clipstitchr/hooks/useStudioBetaAccess";

export function SettingsStudioBetaPanel() {
  const access = useStudioBetaAccess();
  const setPreference = useMutation(
    api.studioBetaAccess.setStudioBetaPreference.setStudioBetaPreference,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!access.isGloballyEnabled || !access.isAllowlisted) {
    return null;
  }

  return (
    <section
      aria-labelledby="studio-beta-setting"
      className="rounded-xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="max-w-2xl">
        <h3
          id="studio-beta-setting"
          className="text-lg font-bold text-text-primary"
        >
          Try Studio Beta
        </h3>
        <p
          id="studio-beta-setting-description"
          className="mt-2 text-sm leading-6 text-text-secondary"
        >
          Open a separate place for deeper research and editing. Your current
          tools, files, and publishing setup stay exactly where they are.
        </p>
      </div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg bg-background px-4 py-3 text-sm text-text-primary">
        <input
          type="checkbox"
          checked={access.isEnabled}
          disabled={isSaving}
          aria-describedby="studio-beta-setting-description"
          className="mt-0.5 h-5 w-5 shrink-0 accent-current"
          onChange={(event) => {
            const enabled = event.currentTarget.checked;

            setError(null);
            setIsSaving(true);
            void setPreference({ enabled })
              .catch(() => {
                setError(
                  "That change did not save. Please wait a moment and try again.",
                );
              })
              .finally(() => setIsSaving(false));
          }}
        />
        <span>
          <span className="block font-bold">Show Studio Beta</span>
          <span className="mt-1 block leading-5 text-text-secondary">
            Turn this off any time. Your Studio work will stay saved.
          </span>
        </span>
      </label>
      <p
        aria-live="polite"
        className={[
          "mt-3 min-h-5 text-sm",
          error ? "text-danger" : "text-text-tertiary",
        ].join(" ")}
      >
        {error ?? (isSaving ? "Saving your choice..." : "")}
      </p>
    </section>
  );
}
