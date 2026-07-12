"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabIdeaScope } from "@/lib/clipstitchr/types/HookLabIdeaScope";
import type { HookLabIdeaUpdateInput } from "@/lib/clipstitchr/types/HookLabIdeaUpdateInput";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

type HookLabIdeaEditDialogProps = {
  activeProductId?: string;
  idea: HookLabIdea;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: HookLabIdeaUpdateInput) => Promise<void>;
};

export function HookLabIdeaEditDialog({
  activeProductId,
  idea,
  isSaving,
  onClose,
  onSave,
}: HookLabIdeaEditDialogProps) {
  const [name, setName] = useState(idea.name);
  const [scope, setScope] = useState<HookLabIdeaScope>(idea.scope);
  const [whatToRepeat, setWhatToRepeat] = useState(idea.whatToRepeat ?? "");
  const [error, setError] = useState<string | null>(null);
  const canSave = name.trim().length > 0 && (scope === "shared" || activeProductId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form
        aria-labelledby="hook-lab-edit-title"
        aria-modal="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-white p-5 shadow-xl"
        role="dialog"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          void onSave({
              name: name.trim(),
              ...(scope === "product" && activeProductId
                ? { productId: activeProductId }
                : {}),
              scope,
              whatToRepeat: whatToRepeat.trim() || undefined,
            })
            .then(onClose)
            .catch((nextError) =>
              setError(getErrorMessage(nextError, "Unable to update that idea.")),
            );
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent-dark">Edit idea</p>
            <h2
              id="hook-lab-edit-title"
              className="mt-1 text-balance text-lg font-bold text-text-primary"
            >
              Keep the useful part clear
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close edit idea dialog"
            icon={<X aria-hidden className="size-4" />}
            disabled={isSaving}
            onClick={onClose}
          />
        </div>
        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">Name</span>
            <input
              value={name}
              maxLength={120}
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              What should ClipStitchr repeat?
            </span>
            <textarea
              value={whatToRepeat}
              maxLength={500}
              rows={4}
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
              placeholder="The feeling, action, or hook pattern worth trying again."
              onChange={(event) => setWhatToRepeat(event.currentTarget.value)}
            />
          </label>
          <SelectInput
            label="Who can use this idea?"
            value={scope}
            options={[
              { label: "All my products", value: "shared" },
              { label: "Only the active product", value: "product" },
            ]}
            onChange={(event) =>
              setScope(event.currentTarget.value as HookLabIdeaScope)
            }
          />
        </div>
        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-pretty text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave} isLoading={isSaving}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
