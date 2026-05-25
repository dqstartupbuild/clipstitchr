"use client";

import { Scissors } from "lucide-react";
import { StitchrModeToggle } from "@/app/_components/stitchr/StitchrModeToggle";
import { Button } from "@/app/_components/ui/Button";
import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";

type ClipPickerActionBarProps = {
  canStitch: boolean;
  mode: StitchrMode;
  selectedUgcCount: number;
  selectedLongrCount?: number;
  isStitching: boolean;
  onModeChange: (mode: StitchrMode) => void;
  onStitch: () => void;
};

export function ClipPickerActionBar({
  canStitch,
  mode,
  selectedUgcCount,
  selectedLongrCount = 0,
  isStitching,
  onModeChange,
  onStitch,
}: ClipPickerActionBarProps) {
  const buttonLabel =
    mode === "longr"
      ? "Create Longr"
      : selectedUgcCount > 1
      ? `Stitch ${selectedUgcCount} ads`
      : "Stitch";

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Stitchr</p>
        <h2 className="mt-0.5 text-base font-bold text-text-primary">
          {mode === "longr" ? "Arrange one Longr stitch" : "Stitch selected clips"}
        </h2>
        {mode === "longr" ? (
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {selectedLongrCount} source clips selected
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StitchrModeToggle value={mode} onChange={onModeChange} />
        <Button
          type="button"
          disabled={!canStitch}
          isLoading={isStitching}
          icon={<Scissors aria-hidden className="h-4 w-4" />}
          onClick={onStitch}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
