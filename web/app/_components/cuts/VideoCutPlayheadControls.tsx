"use client";

import { ChevronLeft, ChevronRight, Flag, Scissors, X } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type VideoCutPlayheadControlsProps = {
  canAddCut: boolean;
  pendingStartSeconds: number | null;
  playheadSeconds: number;
  onAddCut: () => void;
  onClearPendingStart: () => void;
  onCreateMarkedCut: () => void;
  onMarkStart: () => void;
  onStepPlayhead: (stepSeconds: number) => void;
};

export function VideoCutPlayheadControls({
  canAddCut,
  pendingStartSeconds,
  playheadSeconds,
  onAddCut,
  onClearPendingStart,
  onCreateMarkedCut,
  onMarkStart,
  onStepPlayhead,
}: VideoCutPlayheadControlsProps) {
  return (
    <div className="grid min-w-0 gap-2 rounded-lg border border-border bg-white p-2">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <IconButton
            type="button"
            label="Move playhead back"
            icon={<ChevronLeft aria-hidden className="h-4 w-4" />}
            onClick={() => onStepPlayhead(-0.25)}
          />
          <span className="min-w-[4.5rem] rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-bold tabular-nums text-text-primary">
            {formatDuration(playheadSeconds)}
          </span>
          <IconButton
            type="button"
            label="Move playhead forward"
            icon={<ChevronRight aria-hidden className="h-4 w-4" />}
            onClick={() => onStepPlayhead(0.25)}
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<Scissors aria-hidden className="h-4 w-4" />}
          disabled={!canAddCut}
          onClick={onAddCut}
        >
          Add cut
        </Button>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={pendingStartSeconds === null ? "subtle" : "secondary"}
          icon={<Flag aria-hidden className="h-4 w-4" />}
          onClick={onMarkStart}
        >
          Mark start
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<Scissors aria-hidden className="h-4 w-4" />}
          disabled={pendingStartSeconds === null}
          onClick={onCreateMarkedCut}
        >
          Cut range
        </Button>
        {pendingStartSeconds === null ? null : (
          <Button
            type="button"
            size="sm"
            variant="subtle"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClearPendingStart}
          >
            Clear mark
          </Button>
        )}
      </div>
    </div>
  );
}
