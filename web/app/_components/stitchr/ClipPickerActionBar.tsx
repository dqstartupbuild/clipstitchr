"use client";

import { Scissors } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type ClipPickerActionBarProps = {
  addMusic: boolean;
  canStitch: boolean;
  selectedUgcCount: number;
  isStitching: boolean;
  onAddMusicChange: (addMusic: boolean) => void;
  onStitch: () => void;
};

export function ClipPickerActionBar({
  addMusic,
  canStitch,
  selectedUgcCount,
  isStitching,
  onAddMusicChange,
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-secondary">
          <input
            type="checkbox"
            checked={addMusic}
            className="h-4 w-4 accent-accent"
            disabled={isStitching}
            onChange={(event) =>
              onAddMusicChange(event.currentTarget.checked)
            }
          />
          Music
        </label>
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
