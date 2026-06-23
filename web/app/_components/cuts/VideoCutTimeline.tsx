"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { useRef, useState } from "react";
import { VIDEO_TRIM_MIN_DURATION } from "@/lib/clipstitchr/constants/videoTrimBounds";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getTimelineSecondsFromPointer } from "@/lib/clipstitchr/utils/getTimelineSecondsFromPointer";

type VideoCutTimelineDragState =
  | {
      kind: "end";
      index: number;
    }
  | {
      kind: "move";
      index: number;
      offsetSeconds: number;
    }
  | {
      kind: "playhead";
    }
  | {
      kind: "start";
      index: number;
    };

type VideoCutTimelineProps = {
  duration: number;
  pendingStartSeconds: number | null;
  playheadSeconds: number;
  selectedIndex: number | null;
  trimRange: VideoTrimRange;
  value: QuickEditRemoveRange[];
  onCutChange: (index: number, range: QuickEditRemoveRange) => void;
  onPlayheadChange: (seconds: number) => void;
  onSelectCut: (index: number) => void;
};

export function VideoCutTimeline({
  duration,
  pendingStartSeconds,
  playheadSeconds,
  selectedIndex,
  trimRange,
  value,
  onCutChange,
  onPlayheadChange,
  onSelectCut,
}: VideoCutTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] =
    useState<VideoCutTimelineDragState | null>(null);
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const tickCount = safeDuration >= 30 ? 7 : 5;
  const ticks = Array.from({ length: tickCount }, (_, index) =>
    tickCount <= 1 ? 0 : (safeDuration / (tickCount - 1)) * index,
  );
  const toPercent = (seconds: number) =>
    safeDuration > 0
      ? (clamp(seconds, 0, safeDuration) / safeDuration) * 100
      : 0;
  const trimStartPercent = toPercent(trimRange.start);
  const trimEndPercent = toPercent(trimRange.end);
  const playheadPercent = toPercent(playheadSeconds);
  const pendingStartPercent =
    pendingStartSeconds === null ? null : toPercent(pendingStartSeconds);

  const getSeconds = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();

    if (!rect) {
      return 0;
    }

    return getTimelineSecondsFromPointer({
      clientX,
      duration: safeDuration,
      left: rect.left,
      width: rect.width,
    });
  };

  const startDrag = (
    event: PointerEvent<HTMLElement>,
    nextDragState: VideoCutTimelineDragState,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    trackRef.current?.setPointerCapture(event.pointerId);
    setDragState(nextDragState);
  };

  const handleTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (safeDuration <= 0) {
      return;
    }

    const seconds = getSeconds(event.clientX);

    onPlayheadChange(seconds);
    startDrag(event, { kind: "playhead" });
  };

  const handleCutPointerDown = (
    event: PointerEvent<HTMLElement>,
    index: number,
  ) => {
    const range = value[index];

    if (!range) {
      return;
    }

    onSelectCut(index);
    onPlayheadChange(getSeconds(event.clientX));
    startDrag(event, {
      index,
      kind: "move",
      offsetSeconds: getSeconds(event.clientX) - range.start,
    });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState) {
      return;
    }

    const seconds = getSeconds(event.clientX);

    if (dragState.kind === "playhead") {
      onPlayheadChange(seconds);
      return;
    }

    const range = value[dragState.index];

    if (!range) {
      return;
    }

    if (dragState.kind === "start") {
      onCutChange(dragState.index, {
        ...range,
        start: clamp(seconds, 0, range.end - VIDEO_TRIM_MIN_DURATION),
      });
      return;
    }

    if (dragState.kind === "end") {
      onCutChange(dragState.index, {
        ...range,
        end: clamp(seconds, range.start + VIDEO_TRIM_MIN_DURATION, safeDuration),
      });
      return;
    }

    const rangeDuration = Math.max(
      VIDEO_TRIM_MIN_DURATION,
      range.end - range.start,
    );
    const start = clamp(
      seconds - dragState.offsetSeconds,
      0,
      Math.max(0, safeDuration - rangeDuration),
    );

    onCutChange(dragState.index, {
      ...range,
      end: start + rangeDuration,
      start,
    });
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (trackRef.current?.hasPointerCapture(event.pointerId)) {
      trackRef.current.releasePointerCapture(event.pointerId);
    }

    setDragState(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    onPlayheadChange(
      clamp(
        playheadSeconds +
          (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 5 : 0.25),
        0,
        safeDuration,
      ),
    );
  };

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
          Timeline
        </p>
        <p className="text-xs font-semibold text-text-tertiary">
          {formatDuration(playheadSeconds)}
        </p>
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Cut timeline playhead"
        aria-valuemin={0}
        aria-valuemax={safeDuration}
        aria-valuenow={playheadSeconds}
        className="relative h-24 min-w-0 cursor-crosshair rounded-lg border border-border bg-slate-950 px-3 pb-3 pt-6 shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onKeyDown={handleKeyDown}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
      >
        <div className="absolute inset-x-3 top-3 flex justify-between">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="text-[10px] font-semibold text-white/50"
            >
              {formatDuration(tick)}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-3 bottom-5 top-9 rounded-md bg-white/10">
          <div
            aria-hidden
            className="absolute inset-y-0 rounded-md bg-emerald-400/20 ring-1 ring-inset ring-emerald-300/40"
            style={{
              left: `${trimStartPercent}%`,
              right: `${100 - trimEndPercent}%`,
            }}
          />
          {value.map((range, index) => {
            const isSelected = selectedIndex === index;

            return (
              <div
                key={`${range.start}:${range.end}:${index}`}
                role="button"
                tabIndex={0}
                aria-label={`Select cut ${index + 1}`}
                className={[
                  "absolute inset-y-1 cursor-grab rounded-md border bg-red-500/85 shadow-sm transition-colors active:cursor-grabbing",
                  isSelected
                    ? "z-20 border-white ring-2 ring-white"
                    : "z-10 border-red-200/60 hover:bg-red-400/90",
                ].join(" ")}
                style={{
                  left: `${toPercent(range.start)}%`,
                  width: `${Math.max(0.75, toPercent(range.end) - toPercent(range.start))}%`,
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectCut(index);
                  }
                }}
                onPointerDown={(event) => handleCutPointerDown(event, index)}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-3 cursor-ew-resize rounded-l-md bg-white/35"
                  onPointerDown={(event) => {
                    onSelectCut(index);
                    startDrag(event, { index, kind: "start" });
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-y-0 right-0 w-3 cursor-ew-resize rounded-r-md bg-white/35"
                  onPointerDown={(event) => {
                    onSelectCut(index);
                    startDrag(event, { index, kind: "end" });
                  }}
                />
              </div>
            );
          })}
          {pendingStartPercent === null ? null : (
            <div
              aria-hidden
              className="absolute -top-1 bottom-[-0.25rem] z-30 w-0.5 bg-amber-300"
              style={{ left: `${pendingStartPercent}%` }}
            />
          )}
          <div
            aria-hidden
            className="absolute -top-2 bottom-[-0.5rem] z-40 w-0.5 bg-sky-300 shadow-[0_0_0_1px_rgba(255,255,255,0.85)]"
            style={{ left: `${playheadPercent}%` }}
          >
            <span className="absolute -left-1.5 -top-1 h-3 w-3 rotate-45 rounded-sm bg-sky-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
