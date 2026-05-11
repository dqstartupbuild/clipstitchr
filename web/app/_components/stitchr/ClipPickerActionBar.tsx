"use client";

import { Scissors } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type ClipPickerActionBarProps = {
  canStitch: boolean;
  selectedUgcCount: number;
  isStitching: boolean;
  onStitch: () => void;
};

export function ClipPickerActionBar({
  canStitch,
  selectedUgcCount,
  isStitching,
  onStitch,
}: ClipPickerActionBarProps) {
  const buttonLabel =
    selectedUgcCount > 1 ? `Stitch ${selectedUgcCount} ads` : "Stitch";

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Stitchr</p>
        <h2 className="mt-0.5 text-base font-bold text-text-primary">
          Stitch selected clips
        </h2>
      </div>
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
  );
}
