"use client";

import { Plus, Wand2 } from "lucide-react";
import { SwiprTextGenerationScopeToggle } from "@/app/_components/swipr/SwiprTextGenerationScopeToggle";
import { Button } from "@/app/_components/ui/Button";
import { SwiprWritingControls } from "@/app/_components/swipr/SwiprWritingControls";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";
import type { SwiprTextGenerationScope } from "@/lib/clipstitchr/types/SwiprTextGenerationScope";

type SwiprManualControlsProps = {
  callToActionStyle: SwiprCallToActionStyle;
  canAddSlide: boolean;
  creativeContext: string;
  isDisabled: boolean;
  isGeneratingText: boolean;
  slideCount: number;
  textGenerationScope: SwiprTextGenerationScope;
  onAddSlide: () => void;
  onCallToActionStyleChange: (value: SwiprCallToActionStyle) => void;
  onCreativeContextChange: (value: string) => void;
  onGenerateText: () => void;
  onTextGenerationScopeChange: (scope: SwiprTextGenerationScope) => void;
};

export function SwiprManualControls({
  callToActionStyle,
  canAddSlide,
  creativeContext,
  isDisabled,
  isGeneratingText,
  slideCount,
  textGenerationScope,
  onAddSlide,
  onCallToActionStyleChange,
  onCreativeContextChange,
  onGenerateText,
  onTextGenerationScopeChange,
}: SwiprManualControlsProps) {
  return (
    <section className="grid gap-4">
      <SwiprWritingControls
        callToActionStyle={callToActionStyle}
        creativeContext={creativeContext}
        disabled={isDisabled || isGeneratingText}
        onCallToActionStyleChange={onCallToActionStyleChange}
        onCreativeContextChange={onCreativeContextChange}
      />
      <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </section>
  );
}
