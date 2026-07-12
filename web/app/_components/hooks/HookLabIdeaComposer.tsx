"use client";

import { Film, Lightbulb, Save } from "lucide-react";
import { useState } from "react";
import { HookLabIdeaStitchPicker } from "@/app/_components/hooks/HookLabIdeaStitchPicker";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { HookLabIdeaScope } from "@/lib/clipstitchr/types/HookLabIdeaScope";
import type { HookLabStitchSource } from "@/lib/clipstitchr/types/HookLabStitchSource";

type HookLabIdeaComposerProps = {
  activeProductId?: string;
  error: string | null;
  isLoadingStitches: boolean;
  isSaving: boolean;
  stitches: HookLabStitchSource[];
  onSaveStitch: (stitchId: string, scope: HookLabIdeaScope) => Promise<void>;
  onSaveValue: (value: string, scope: HookLabIdeaScope) => Promise<void>;
};

export function HookLabIdeaComposer({
  activeProductId,
  error,
  isLoadingStitches,
  isSaving,
  stitches,
  onSaveStitch,
  onSaveValue,
}: HookLabIdeaComposerProps) {
  const [isStitchPickerOpen, setIsStitchPickerOpen] = useState(false);
  const [scope, setScope] = useState<HookLabIdeaScope>("shared");
  const [value, setValue] = useState("");
  const canSave = value.trim().length > 0 && (scope === "shared" || activeProductId);

  return (
    <Panel className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-accent-dark">
          <Lightbulb aria-hidden className="size-5" />
        </span>
        <div>
          <h2 className="text-balance text-lg font-bold text-text-primary">
            Add an idea
          </h2>
          <p className="mt-1 text-pretty text-sm leading-6 text-text-secondary">
            Save a line, post, or past Stitch. Hook Lab learns what made it work
            and turns it into a fresh Stitch for your product.
          </p>
        </div>
      </div>
      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void onSaveValue(value, scope).then(() => setValue(""));
        }}
      >
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Paste a hook or a public TikTok or Instagram link
          </span>
          <textarea
            id="hook-lab-idea-input"
            value={value}
            rows={3}
            maxLength={2048}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15"
            placeholder="A line worth trying, or a public post link"
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
          <SelectInput
            label="Save for"
            value={scope}
            options={[
              { label: "All my products", value: "shared" },
              { label: "Only the active product", value: "product" },
            ]}
            onChange={(event) =>
              setScope(event.currentTarget.value as HookLabIdeaScope)
            }
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              icon={<Film aria-hidden className="size-4" />}
              disabled={
                isSaving || (scope === "product" && !activeProductId)
              }
              onClick={() => setIsStitchPickerOpen(true)}
            >
              Choose a Stitch
            </Button>
            <Button
              type="submit"
              icon={<Save aria-hidden className="size-4" />}
              disabled={!canSave}
              isLoading={isSaving}
            >
              Save idea
            </Button>
          </div>
        </div>
      </form>
      {scope === "product" && !activeProductId ? (
        <p className="mt-3 text-sm font-semibold text-amber-700">
          Choose an active product before saving this idea for one product.
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-pretty text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      {isStitchPickerOpen ? (
        <HookLabIdeaStitchPicker
          isLoading={isLoadingStitches}
          stitches={stitches}
          onClose={() => setIsStitchPickerOpen(false)}
          onSelect={(stitch) => {
            void onSaveStitch(stitch.id, scope).then(() =>
              setIsStitchPickerOpen(false),
            );
          }}
        />
      ) : null}
    </Panel>
  );
}
