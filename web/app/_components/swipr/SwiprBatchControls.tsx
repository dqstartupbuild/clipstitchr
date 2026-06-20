"use client";

import { Images } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SWIPR_BATCH_DRAFT_COUNT } from "@/lib/clipstitchr/constants/swiprBatchDraftCount";

type SwiprBatchControlsProps = {
  isDisabled: boolean;
  isGeneratingDrafts: boolean;
  onGenerateDrafts: () => void;
};

export function SwiprBatchControls({
  isDisabled,
  isGeneratingDrafts,
  onGenerateDrafts,
}: SwiprBatchControlsProps) {
  return (
    <section className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-semibold text-text-secondary">
        Creates {SWIPR_BATCH_DRAFT_COUNT} Swipes in batch.
      </p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Images aria-hidden className="h-4 w-4" />}
        disabled={isDisabled}
        isLoading={isGeneratingDrafts}
        onClick={onGenerateDrafts}
      >
        Generate Swipes
      </Button>
    </section>
  );
}
