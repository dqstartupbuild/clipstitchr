"use client";

import { Scissors } from "lucide-react";
import { StitchrModeToggle } from "@/app/_components/stitchr/StitchrModeToggle";
import { StitchrBatchTextStylePanel } from "@/app/_components/stitchr/StitchrBatchTextStylePanel";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";

type StitchrBatchPanelProps = {
  backgroundColorChoice: AutomationStitchrColorChoice;
  dailyLimit: number;
  isDisabled: boolean;
  isGenerating: boolean;
  message: string | null;
  mode: StitchrMode;
  strokeColorChoice: AutomationStitchrColorChoice;
  textColorChoice: AutomationStitchrColorChoice;
  textStyleChoice: AutomationStitchrTextStyleChoice;
  onBackgroundColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onGenerate: () => void;
  onModeChange: (mode: StitchrMode) => void;
  onStrokeColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onTextColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onTextStyleChoiceChange: (value: AutomationStitchrTextStyleChoice) => void;
};

export function StitchrBatchPanel({
  backgroundColorChoice,
  dailyLimit,
  isDisabled,
  isGenerating,
  message,
  mode,
  strokeColorChoice,
  textColorChoice,
  textStyleChoice,
  onBackgroundColorChoiceChange,
  onGenerate,
  onModeChange,
  onStrokeColorChoiceChange,
  onTextColorChoiceChange,
  onTextStyleChoiceChange,
}: StitchrBatchPanelProps) {
  return (
    <Panel className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">Stitchr</p>
            <h2 className="mt-0.5 text-base font-bold text-text-primary">
              Generate stitches in batch
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              Creates up to {dailyLimit} fresh Stitches from your UGC and Demo clips.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StitchrModeToggle value={mode} onChange={onModeChange} />
            <Button
              type="button"
              disabled={isDisabled}
              isLoading={isGenerating}
              icon={<Scissors aria-hidden className="h-4 w-4" />}
              onClick={onGenerate}
            >
              Generate {dailyLimit} Stitches
            </Button>
          </div>
        </div>
        <StitchrBatchTextStylePanel
          backgroundColorChoice={backgroundColorChoice}
          disabled={isGenerating}
          strokeColorChoice={strokeColorChoice}
          textColorChoice={textColorChoice}
          textStyleChoice={textStyleChoice}
          onBackgroundColorChoiceChange={onBackgroundColorChoiceChange}
          onStrokeColorChoiceChange={onStrokeColorChoiceChange}
          onTextColorChoiceChange={onTextColorChoiceChange}
          onTextStyleChoiceChange={onTextStyleChoiceChange}
        />
      </div>
      {message ? (
        <p className="mt-4 rounded-lg border border-accent/25 bg-surface-muted px-3 py-2 text-sm font-semibold text-accent-dark">
          {message}
        </p>
      ) : null}
    </Panel>
  );
}
