"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { WorkspaceSettings } from "@/lib/clipstitchr/types/WorkspaceSettings";
import type { WorkspaceSettingsUpdate } from "@/lib/clipstitchr/types/WorkspaceSettingsUpdate";

type WorkspaceSettingsFormProps = {
  settings: WorkspaceSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (settings: WorkspaceSettingsUpdate) => Promise<void>;
};

export function WorkspaceSettingsForm({
  settings,
  isLoading,
  isSaving,
  onSave,
}: WorkspaceSettingsFormProps) {
  const [productDetails, setProductDetails] = useState(
    settings?.productDetails ?? "",
  );
  const [audienceDetails, setAudienceDetails] = useState(
    settings?.audienceDetails ?? "",
  );
  const [isDirty, setIsDirty] = useState(false);
  const [didSave, setDidSave] = useState(false);
  const canSave = isDirty && !isLoading && !isSaving;

  return (
    <Panel className="p-5">
      <form
        className="flex flex-col gap-5"
        onSubmit={async (event) => {
          event.preventDefault();

          if (!canSave) {
            return;
          }

          await onSave({
            productDetails,
            audienceDetails,
          });
          setDidSave(true);
          setIsDirty(false);
        }}
      >
        <div>
          <p className="text-sm font-semibold text-accent-dark">
            Workspace Context
          </p>
          <h2 className="mt-2 text-xl font-bold text-text-primary">
            Product and audience
          </h2>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Product details
          </span>
          <textarea
            value={productDetails}
            maxLength={2000}
            rows={6}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder="Product, offer, benefits, proof points, pricing, constraints."
            onChange={(event) => {
              setProductDetails(event.currentTarget.value);
              setIsDirty(true);
              setDidSave(false);
            }}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Audience details
          </span>
          <textarea
            value={audienceDetails}
            maxLength={2000}
            rows={6}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder="Audience, pains, objections, buying triggers, language to use or avoid."
            onChange={(event) => {
              setAudienceDetails(event.currentTarget.value);
              setIsDirty(true);
              setDidSave(false);
            }}
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-text-secondary">
            {didSave ? "Saved." : "Used as default context for Swipr."}
          </p>
          <Button
            type="submit"
            icon={<Save aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={!canSave}
          >
            Save settings
          </Button>
        </div>
      </form>
    </Panel>
  );
}
