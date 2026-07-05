"use client";

import { Scissors } from "lucide-react";
import { StitchrBatchHookReviewList } from "@/app/_components/stitchr/StitchrBatchHookReviewList";
import { StitchrModeToggle } from "@/app/_components/stitchr/StitchrModeToggle";
import { StitchrBatchTextStylePanel } from "@/app/_components/stitchr/StitchrBatchTextStylePanel";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";

type StitchrBatchPanelProps = {
  backgroundColorChoice: AutomationStitchrColorChoice;
  dailyLimit: number;
  description?: string;
  generateButtonLabel?: string;
  hookPlans?: StitchrHookPlan[];
  isDisabled: boolean;
  isGenerating: boolean;
  savingHookPlanId?: string | null;
  message: string | null;
  mode: StitchrMode;
  selectedSoundTrack: SharedMusicTrack | null;
  showModeToggle?: boolean;
  strokeColorChoice: AutomationStitchrColorChoice;
  textColorChoice: AutomationStitchrColorChoice;
  textStyleChoice: AutomationStitchrTextStyleChoice;
  onAcceptHookVariant?: (planId: string, hookText: string) => void;
  onBackgroundColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onGenerate: () => void;
  onModeChange: (mode: StitchrMode) => void;
  onRejectHookVariant?: (planId: string, hookText: string) => void;
  onSelectSoundTrack: (track: SharedMusicTrack) => void | Promise<void>;
  onSelectHookVariant?: (planId: string, hookText: string) => void;
  onStrokeColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onTextColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onTextStyleChoiceChange: (value: AutomationStitchrTextStyleChoice) => void;
};

export function StitchrBatchPanel({
  backgroundColorChoice,
  dailyLimit,
  description,
  generateButtonLabel,
  hookPlans = [],
  isDisabled,
  isGenerating,
  savingHookPlanId = null,
  message,
  mode,
  selectedSoundTrack,
  showModeToggle = true,
  strokeColorChoice,
  textColorChoice,
  textStyleChoice,
  onAcceptHookVariant,
  onBackgroundColorChoiceChange,
  onGenerate,
  onModeChange,
  onRejectHookVariant,
  onSelectSoundTrack,
  onSelectHookVariant,
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
              {description ??
                `Creates up to ${dailyLimit} fresh Stitches from Hook/UGC and demo clips.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {showModeToggle ? (
              <StitchrModeToggle value={mode} onChange={onModeChange} />
            ) : null}
            <MusicSelectorButton
              label={selectedSoundTrack ? "Change sound" : "Add sound"}
              source="stitchr"
              selectedTrackId={selectedSoundTrack?.id}
              onSelectTrack={onSelectSoundTrack}
            />
            <Button
              type="button"
              disabled={isDisabled}
              isLoading={isGenerating}
              icon={<Scissors aria-hidden className="h-4 w-4" />}
              onClick={onGenerate}
            >
              {generateButtonLabel ?? `Generate ${dailyLimit} Stitches`}
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
      {onAcceptHookVariant && onRejectHookVariant && onSelectHookVariant ? (
        <StitchrBatchHookReviewList
          hookPlans={hookPlans}
          savingPlanId={savingHookPlanId}
          onAcceptHookVariant={onAcceptHookVariant}
          onRejectHookVariant={onRejectHookVariant}
          onSelectHookVariant={onSelectHookVariant}
        />
      ) : null}
    </Panel>
  );
}
