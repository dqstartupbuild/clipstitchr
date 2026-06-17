"use client";

import { Plus, Wand2 } from "lucide-react";
import { SwiprTextGenerationScopeToggle } from "@/app/_components/swipr/SwiprTextGenerationScopeToggle";
import { Button } from "@/app/_components/ui/Button";
import type { SwiprTextGenerationScope } from "@/lib/clipstitchr/types/SwiprTextGenerationScope";

type SwiprManualControlsProps = {
  canAddSlide: boolean;
  isDisabled: boolean;
  isGeneratingText: boolean;
  slideCount: number;
  textGenerationScope: SwiprTextGenerationScope;
  onAddSlide: () => void;
  onGenerateText: () => void;
  onTextGenerationScopeChange: (scope: SwiprTextGenerationScope) => void;
};

export function SwiprManualControls({
  canAddSlide,
  isDisabled,
  isGeneratingText,
  slideCount,
  textGenerationScope,
  onAddSlide,
  onGenerateText,
  onTextGenerationScopeChange,
}: SwiprManualControlsProps) {
  return (
    <section className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Plus aria-hidden className="h-4 w-4" />}
        disabled={isDisabled || !canAddSlide}
        onClick={onAddSlide}
      >
        Add slide
      </Button>
      <SwiprTextGenerationScopeToggle
        value={textGenerationScope}
        onChange={onTextGenerationScopeChange}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Wand2 aria-hidden className="h-4 w-4" />}
        disabled={isDisabled || !slideCount}
        isLoading={isGeneratingText}
        onClick={onGenerateText}
      >
        Generate text
      </Button>
    </section>
  );
}
