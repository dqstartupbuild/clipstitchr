"use client";

import { Sparkles } from "lucide-react";
import { SwiprDraftGenerationCountControl } from "@/app/_components/swipr/SwiprDraftGenerationCountControl";
import { Button } from "@/app/_components/ui/Button";

type SwiprBatchControlsProps = {
  draftGenerationCount: number;
  isDisabled: boolean;
  isGeneratingDrafts: boolean;
  onDraftGenerationCountChange: (count: number) => void;
  onGenerateDrafts: () => void;
};

export function SwiprBatchControls({
  draftGenerationCount,
  isDisabled,
  isGeneratingDrafts,
  onDraftGenerationCountChange,
  onGenerateDrafts,
}: SwiprBatchControlsProps) {
  return (
    <section className="flex flex-wrap items-center gap-2">
      <SwiprDraftGenerationCountControl
        value={draftGenerationCount}
        disabled={isDisabled || isGeneratingDrafts}
        onChange={onDraftGenerationCountChange}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Sparkles aria-hidden className="h-4 w-4" />}
        disabled={isDisabled}
        isLoading={isGeneratingDrafts}
        onClick={onGenerateDrafts}
      >
        Generate drafts
      </Button>
    </section>
  );
}
