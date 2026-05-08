"use client";

import { Scissors } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type ClipPickerActionBarProps = {
  canStitch: boolean;
  isStitching: boolean;
  onStitch: () => void;
};

export function ClipPickerActionBar({
  canStitch,
  isStitching,
  onStitch,
}: ClipPickerActionBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Stitchr</p>
        <h2 className="mt-2 text-lg font-bold text-text-primary">
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
        Stitch
      </Button>
    </div>
  );
}
