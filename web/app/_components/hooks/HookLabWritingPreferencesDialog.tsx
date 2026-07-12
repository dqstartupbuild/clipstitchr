"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { HookLabAvoidPhraseList } from "@/app/_components/hooks/HookLabAvoidPhraseList";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { hookEdgeLevelOptions } from "@/lib/clipstitchr/constants/hookEdgeLevelOptions";
import { hookGenerationGoalOptions } from "@/lib/clipstitchr/constants/hookGenerationGoalOptions";
import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";
import type { HookLabWritingPreferencesInput } from "@/lib/clipstitchr/types/HookLabWritingPreferencesInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

type HookLabWritingPreferencesDialogProps = {
  isSaving: boolean;
  product: ProductProfile;
  onClose: () => void;
  onSave: (input: HookLabWritingPreferencesInput) => Promise<void>;
};

export function HookLabWritingPreferencesDialog({
  isSaving,
  product,
  onClose,
  onSave,
}: HookLabWritingPreferencesDialogProps) {
  const [hookEdgeLevel, setHookEdgeLevel] = useState<HookEdgeLevel>(
    product.hookEdgeLevel ?? "punchy",
  );
  const [hookGenerationGoal, setHookGenerationGoal] =
    useState<HookGenerationGoal>(product.hookGenerationGoal ?? "views");
  const [rejectedHookExamples, setRejectedHookExamples] = useState(
    product.rejectedHookExamples ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form
        aria-labelledby="hook-lab-writing-preferences-title"
        aria-modal="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-white p-5 shadow-xl"
        role="dialog"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          void onSave({
            hookEdgeLevel,
            hookGenerationGoal,
            rejectedHookExamples,
          })
            .then(onClose)
            .catch((nextError) =>
              setError(
                getErrorMessage(
                  nextError,
                  "Unable to save those writing preferences.",
                ),
              ),
            );
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              {product.name}
            </p>
            <h2
              id="hook-lab-writing-preferences-title"
              className="mt-1 text-balance text-xl font-bold text-text-primary"
            >
              Writing preferences
            </h2>
            <p className="mt-1 text-pretty text-sm leading-6 text-text-secondary">
              Keep the goal and tone simple. Saved Ideas teach ClipStitchr what
              you like.
            </p>
          </div>
          <IconButton
            type="button"
            label="Close writing preferences"
            icon={<X aria-hidden className="size-4" />}
            disabled={isSaving}
            onClick={onClose}
          />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Main goal"
            value={hookGenerationGoal}
            options={hookGenerationGoalOptions}
            onChange={(event) =>
              setHookGenerationGoal(
                event.currentTarget.value as HookGenerationGoal,
              )
            }
          />
          <SelectInput
            label="Tone"
            value={hookEdgeLevel}
            options={hookEdgeLevelOptions}
            onChange={(event) =>
              setHookEdgeLevel(event.currentTarget.value as HookEdgeLevel)
            }
          />
        </div>
        <div className="mt-5">
          <HookLabAvoidPhraseList
            phrases={rejectedHookExamples}
            onChange={setRejectedHookExamples}
          />
        </div>
        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-pretty text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Save preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
