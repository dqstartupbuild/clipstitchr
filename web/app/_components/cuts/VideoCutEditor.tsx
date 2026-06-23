"use client";

import { Scissors } from "lucide-react";
import { useState } from "react";
import { VideoCutPlayheadControls } from "@/app/_components/cuts/VideoCutPlayheadControls";
import { VideoCutRangeFields } from "@/app/_components/cuts/VideoCutRangeFields";
import { VideoCutRangeList } from "@/app/_components/cuts/VideoCutRangeList";
import { VideoCutTimeline } from "@/app/_components/cuts/VideoCutTimeline";
import { Button } from "@/app/_components/ui/Button";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getManualCutRangeAtPlayhead } from "@/lib/clipstitchr/utils/getManualCutRangeAtPlayhead";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getVideoCutRangeFromMarkedTimes } from "@/lib/clipstitchr/utils/getVideoCutRangeFromMarkedTimes";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

type VideoCutEditorProps = {
  duration: number;
  playheadSeconds?: number;
  saveLabel?: string;
  showActions?: boolean;
  title: string;
  trimRange: {
    end: number;
    start: number;
  };
  value: QuickEditRemoveRange[];
  onCancel?: () => void;
  onChange: (removeRanges: QuickEditRemoveRange[]) => void;
  onSave?: (removeRanges: QuickEditRemoveRange[]) => void | Promise<void>;
  onSeek?: (seconds: number) => void;
};

export function VideoCutEditor({
  duration,
  playheadSeconds: controlledPlayheadSeconds,
  saveLabel = "Save cuts",
  showActions = true,
  title,
  trimRange,
  value,
  onCancel,
  onChange,
  onSave,
  onSeek,
}: VideoCutEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [pendingStartSeconds, setPendingStartSeconds] = useState<number | null>(
    null,
  );
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const [localPlayheadSeconds, setLocalPlayheadSeconds] = useState(() =>
    clamp(trimRange.start, 0, safeDuration),
  );
  const [selectedCutIndexState, setSelectedCutIndex] = useState<number | null>(
    value.length ? 0 : null,
  );
  const normalizedRanges = normalizeQuickEditRemoveRanges(value, duration);
  const playheadSeconds =
    controlledPlayheadSeconds === undefined
      ? clamp(localPlayheadSeconds, 0, safeDuration)
      : clamp(controlledPlayheadSeconds, 0, safeDuration);
  const selectedCutIndex =
    selectedCutIndexState !== null &&
    selectedCutIndexState < normalizedRanges.length
      ? selectedCutIndexState
      : normalizedRanges.length
        ? 0
        : null;
  const editedDuration = getQuickEditPlaybackDuration(
    trimRange,
    duration,
    normalizedRanges,
  );
  const playheadCutRange = getManualCutRangeAtPlayhead({
    duration,
    playheadSeconds,
    trimRange,
  });
  const selectedRange =
    selectedCutIndex === null ? null : normalizedRanges[selectedCutIndex];

  const setPlayheadSeconds = (nextPlayheadSeconds: number) => {
    const clampedPlayheadSeconds = clamp(nextPlayheadSeconds, 0, safeDuration);

    setLocalPlayheadSeconds(clampedPlayheadSeconds);
    onSeek?.(clampedPlayheadSeconds);
  };

  const updateCut = (index: number, range: QuickEditRemoveRange) => {
    onChange(
      normalizeQuickEditRemoveRanges(
        normalizedRanges.map((currentRange, currentIndex) =>
          currentIndex === index ? range : currentRange,
        ),
        duration,
      ),
    );
  };

  const removeCut = (index: number) => {
    onChange(
      normalizedRanges.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const selectCutNearPlayhead = (removeRanges: QuickEditRemoveRange[]) => {
    const nextIndex = removeRanges.findIndex(
      (range) => playheadSeconds >= range.start && playheadSeconds <= range.end,
    );

    setSelectedCutIndex(nextIndex >= 0 ? nextIndex : removeRanges.length - 1);
  };

  const applyNewCut = (range: { end: number; start: number }) => {
    const nextRanges = normalizeQuickEditRemoveRanges(
      [
        ...normalizedRanges,
        {
          ...range,
          reason: "Cut by hand",
        },
      ],
      duration,
    );

    onChange(nextRanges);
    selectCutNearPlayhead(nextRanges);
  };

  const addCutAtPlayhead = () => {
    if (!playheadCutRange) {
      return;
    }

    applyNewCut(playheadCutRange);
  };

  const createMarkedCut = () => {
    if (pendingStartSeconds === null) {
      return;
    }

    const markedRange = getVideoCutRangeFromMarkedTimes({
      duration,
      endSeconds: playheadSeconds,
      startSeconds: pendingStartSeconds,
    });

    if (!markedRange) {
      return;
    }

    applyNewCut(markedRange);
    setPendingStartSeconds(null);
  };

  const stepPlayhead = (stepSeconds: number) => {
    setPlayheadSeconds(playheadSeconds + stepSeconds);
  };

  const handleSelectedRangeChange = (nextRange: QuickEditRemoveRange) => {
    if (selectedCutIndex === null) {
      return;
    }

    updateCut(selectedCutIndex, nextRange);
  };

  const handleSelectedRangeRemove = () => {
    if (selectedCutIndex === null) {
      return;
    }

    removeCut(selectedCutIndex);
  };

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave(normalizedRanges);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-surface-elevated p-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
          {title}
        </p>
        <p className="mt-1 text-xs font-semibold text-text-tertiary">
          {normalizedRanges.length
            ? `${normalizedRanges.length} cut${normalizedRanges.length === 1 ? "" : "s"} . ${formatDuration(editedDuration)} left`
            : "No cuts yet"}
        </p>
      </div>
      <div className="mt-3 grid gap-3">
        <VideoCutTimeline
          duration={duration}
          pendingStartSeconds={pendingStartSeconds}
          playheadSeconds={playheadSeconds}
          selectedIndex={selectedCutIndex}
          trimRange={trimRange}
          value={normalizedRanges}
          onCutChange={updateCut}
          onPlayheadChange={setPlayheadSeconds}
          onSelectCut={setSelectedCutIndex}
        />
        <VideoCutPlayheadControls
          canAddCut={Boolean(playheadCutRange)}
          pendingStartSeconds={pendingStartSeconds}
          playheadSeconds={playheadSeconds}
          onAddCut={addCutAtPlayhead}
          onClearPendingStart={() => setPendingStartSeconds(null)}
          onCreateMarkedCut={createMarkedCut}
          onMarkStart={() => setPendingStartSeconds(playheadSeconds)}
          onStepPlayhead={stepPlayhead}
        />
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.85fr)]">
          <VideoCutRangeList
            selectedIndex={selectedCutIndex}
            value={normalizedRanges}
            onRemove={removeCut}
            onSelect={setSelectedCutIndex}
          />
          {selectedRange ? (
            <VideoCutRangeFields
              duration={duration}
              index={selectedCutIndex ?? 0}
              value={selectedRange}
              onChange={handleSelectedRangeChange}
              onRemove={handleSelectedRangeRemove}
            />
          ) : (
            <div className="rounded-lg border border-border bg-white p-3 text-sm font-semibold text-text-tertiary">
              No cut selected
            </div>
          )}
        </div>
      </div>
      {showActions ? (
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="subtle" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            icon={<Scissors aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            onClick={handleSave}
          >
            {saveLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
