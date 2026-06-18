"use client";

import { Scissors } from "lucide-react";
import { StitchrModeToggle } from "@/app/_components/stitchr/StitchrModeToggle";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";

type StitchrBatchPanelProps = {
  dailyLimit: number;
  isDisabled: boolean;
  isGenerating: boolean;
  message: string | null;
  mode: StitchrMode;
  onGenerate: () => void;
  onModeChange: (mode: StitchrMode) => void;
};

export function StitchrBatchPanel({
  dailyLimit,
  isDisabled,
  isGenerating,
  message,
  mode,
  onGenerate,
  onModeChange,
}: StitchrBatchPanelProps) {
  return (
    <Panel className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent-dark">Stitchr</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Generate today&apos;s stitch batch
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">
            Creates up to {dailyLimit} fresh Stitch drafts from your UGC and
            Demo clips, using recent pair history to avoid repeats.
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
      {message ? (
        <p className="mt-4 rounded-lg border border-accent/25 bg-surface-muted px-3 py-2 text-sm font-semibold text-accent-dark">
          {message}
        </p>
      ) : null}
    </Panel>
  );
}
