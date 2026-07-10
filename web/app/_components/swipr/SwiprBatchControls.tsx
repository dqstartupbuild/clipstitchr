"use client";

import { Images } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SwiprWritingControls } from "@/app/_components/swipr/SwiprWritingControls";
import { SWIPR_BATCH_DRAFT_COUNT } from "@/lib/clipstitchr/constants/swiprBatchDraftCount";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

type SwiprBatchControlsProps = {
  callToActionStyle: SwiprCallToActionStyle;
  creativeContext: string;
  isDisabled: boolean;
  isGeneratingDrafts: boolean;
  onGenerateDrafts: () => void;
  onCallToActionStyleChange: (value: SwiprCallToActionStyle) => void;
  onCreativeContextChange: (value: string) => void;
};

export function SwiprBatchControls({
  callToActionStyle,
  creativeContext,
  isDisabled,
  isGeneratingDrafts,
  onGenerateDrafts,
  onCallToActionStyleChange,
  onCreativeContextChange,
}: SwiprBatchControlsProps) {
  return (
    <section className="grid gap-4">
      <SwiprWritingControls
        callToActionStyle={callToActionStyle}
        creativeContext={creativeContext}
        disabled={isDisabled || isGeneratingDrafts}
        onCallToActionStyleChange={onCallToActionStyleChange}
        onCreativeContextChange={onCreativeContextChange}
      />
      <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </section>
  );
}
