"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { HookOptionFeedbackBadge } from "@/app/_components/hooks/HookOptionFeedbackBadge";
import { Button } from "@/app/_components/ui/Button";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";

type StitchrHookOptionSelectorProps = {
  hookPlanId?: string;
  hookVariants: StitchrHookVariant[];
  isSaving: boolean;
  selectedHook: string;
  onAcceptHookVariant: (hookText: string) => void;
  onRejectHookVariant: (hookText: string) => void;
  onSelectHookVariant: (hookText: string) => void;
};

export function StitchrHookOptionSelector({
  hookPlanId,
  hookVariants,
  isSaving,
  selectedHook,
  onAcceptHookVariant,
  onRejectHookVariant,
  onSelectHookVariant,
}: StitchrHookOptionSelectorProps) {
  const selectedHookText = selectedHook || hookVariants[0]?.text || "";
  const selectedVariant =
    hookVariants.find((variant) => variant.text === selectedHookText) ??
    hookVariants[0];
  const selectedFeedbackStatus = selectedVariant?.feedbackStatus;
  const canSaveFeedback = Boolean(hookPlanId && selectedVariant);

  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3">
        <SelectInput
          label="Hook"
          value={selectedHookText}
          options={hookVariants.map((variant) => ({
            label: variant.text,
            value: variant.text,
          }))}
          onChange={(event) => onSelectHookVariant(event.currentTarget.value)}
        />
        {selectedVariant ? (
          <div className="rounded-md border border-border bg-white p-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-bold text-text-primary">
                  {selectedVariant.text}
                </p>
                {selectedVariant.angle ? (
                  <p className="mt-1 text-xs font-semibold text-accent-dark">
                    {selectedVariant.angle}
                  </p>
                ) : null}
              </div>
              <HookOptionFeedbackBadge status={selectedFeedbackStatus} />
            </div>
            {selectedVariant.reason ? (
              <p className="mt-2 text-xs leading-5 text-text-secondary">
                {selectedVariant.reason}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<ThumbsUp aria-hidden className="h-4 w-4" />}
            disabled={
              !canSaveFeedback || selectedFeedbackStatus === "accepted"
            }
            isLoading={isSaving}
            onClick={() => onAcceptHookVariant(selectedHookText)}
          >
            Accept hook
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            icon={<ThumbsDown aria-hidden className="h-4 w-4" />}
            disabled={!canSaveFeedback || selectedFeedbackStatus === "rejected"}
            isLoading={isSaving}
            onClick={() => onRejectHookVariant(selectedHookText)}
          >
            Reject hook
          </Button>
        </div>
      </div>
    </div>
  );
}
