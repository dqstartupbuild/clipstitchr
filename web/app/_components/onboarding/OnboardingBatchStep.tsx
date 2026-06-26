"use client";

import { useState } from "react";
import { StitchrBatchPanel } from "@/app/_components/stitchr/StitchrBatchPanel";
import { Panel } from "@/app/_components/ui/Panel";
import { OnboardingStepHeader } from "@/app/_components/onboarding/OnboardingStepHeader";
import { defaultAutomationStitchrColorChoice } from "@/lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { STITCHR_BATCH_DAILY_LIMIT } from "@/lib/clipstitchr/constants/stitchrBatchGenerationLimits";
import type { GenerateStitchrBatchOptions } from "@/lib/clipstitchr/client/generateStitchrBatch";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";

type OnboardingBatchStepProps = {
  demoCount: number;
  isGenerating: boolean;
  message: string | null;
  ugcCount: number;
  onGenerate: (options: GenerateStitchrBatchOptions) => void;
};

export function OnboardingBatchStep({
  demoCount,
  isGenerating,
  message,
  ugcCount,
  onGenerate,
}: OnboardingBatchStepProps) {
  const [textStyleChoice, setTextStyleChoice] =
    useState<AutomationStitchrTextStyleChoice>(
      defaultAutomationStitchrTextStyleChoice,
    );
  const [textColorChoice, setTextColorChoice] =
    useState<AutomationStitchrColorChoice>(defaultAutomationStitchrColorChoice);
  const [backgroundColorChoice, setBackgroundColorChoice] =
    useState<AutomationStitchrColorChoice>(defaultAutomationStitchrColorChoice);
  const [strokeColorChoice, setStrokeColorChoice] =
    useState<AutomationStitchrColorChoice>(defaultAutomationStitchrColorChoice);
  const isDisabled = ugcCount === 0 || demoCount === 0 || isGenerating;

  return (
    <div className="flex flex-col gap-5">
      <Panel className="p-5">
        <OnboardingStepHeader
          eyebrow="Batch"
          title="Create the first batch"
          description="Choose how the text should look. ClipStitchr will pair your UGC with the demo and send the finished drafts to your library."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-muted p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
              UGC ready
            </p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {ugcCount}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-muted p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
              Demos ready
            </p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {demoCount}
            </p>
          </div>
        </div>
      </Panel>
      <StitchrBatchPanel
        backgroundColorChoice={backgroundColorChoice}
        dailyLimit={STITCHR_BATCH_DAILY_LIMIT}
        description="Creates a batch of finished stitches from the clips you just added."
        generateButtonLabel="Create batch"
        isDisabled={isDisabled}
        isGenerating={isGenerating}
        message={message}
        mode="batch"
        selectedSoundTrack={null}
        showModeToggle={false}
        strokeColorChoice={strokeColorChoice}
        textColorChoice={textColorChoice}
        textStyleChoice={textStyleChoice}
        onBackgroundColorChoiceChange={setBackgroundColorChoice}
        onGenerate={() =>
          onGenerate({
            stitchrTextBackgroundColorChoice: backgroundColorChoice,
            stitchrTextColorChoice: textColorChoice,
            stitchrTextStrokeColorChoice: strokeColorChoice,
            stitchrTextStyleChoice: textStyleChoice,
          })
        }
        onModeChange={() => undefined}
        onSelectSoundTrack={() => undefined}
        onStrokeColorChoiceChange={setStrokeColorChoice}
        onTextColorChoiceChange={setTextColorChoice}
        onTextStyleChoiceChange={setTextStyleChoice}
      />
    </div>
  );
}
