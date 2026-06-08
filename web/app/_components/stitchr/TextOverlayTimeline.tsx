"use client";

import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { TEXT_OVERLAY_MIN_DURATION } from "@/lib/clipstitchr/constants/textOverlayBounds";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type TimelineHandle = "start" | "end";

type TextOverlayTimelineProps = {
  textOverlay: TextOverlay;
  totalDuration: number;
  ugcDuration: number;
  currentTime: number;
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayTimeline({
  textOverlay,
  totalDuration,
  ugcDuration,
  currentTime,
  onChange,
}: TextOverlayTimelineProps) {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const safeDuration = Math.max(totalDuration, TEXT_OVERLAY_MIN_DURATION);
  const startPercent = (textOverlay.startTime / safeDuration) * 100;
  const endPercent = (textOverlay.endTime / safeDuration) * 100;
  const playheadPercent =
    (clamp(currentTime, 0, safeDuration) / safeDuration) * 100;
  const boundaryPercent =
    (clamp(ugcDuration, 0, safeDuration) / safeDuration) * 100;

  const updateHandle = useCallback(
    (handle: TimelineHandle, clientX: number) => {
      const timeline = timelineRef.current;

      if (!timeline) {
        return;
      }

      const rect = timeline.getBoundingClientRect();
      const nextTime =
        (clamp(clientX - rect.left, 0, rect.width) / rect.width) * safeDuration;
      const nextOverlay =
        handle === "start"
          ? {
              ...textOverlay,
              startTime: Math.min(
                nextTime,
                textOverlay.endTime - TEXT_OVERLAY_MIN_DURATION,
              ),
            }
          : {
              ...textOverlay,
              endTime: Math.max(
                nextTime,
                textOverlay.startTime + TEXT_OVERLAY_MIN_DURATION,
              ),
            };

      onChange(clampTextOverlay(nextOverlay, totalDuration));
    },
    [onChange, safeDuration, textOverlay, totalDuration],
  );

  const handlePointerDown = useCallback(
    (handle: TimelineHandle) =>
      (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      updateHandle(handle, event.clientX);

      const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
        updateHandle(handle, moveEvent.clientX);
      };

      const handlePointerUp = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [updateHandle],
  );

  const handleKeyDown = useCallback(
    (handle: TimelineHandle) =>
      (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
          return;
        }

        event.preventDefault();

        const direction = event.key === "ArrowLeft" ? -1 : 1;
        const step = event.shiftKey ? 1 : 0.1;
        const nextOverlay =
          handle === "start"
            ? {
                ...textOverlay,
                startTime: textOverlay.startTime + direction * step,
              }
            : {
                ...textOverlay,
                endTime: textOverlay.endTime + direction * step,
              };

        onChange(clampTextOverlay(nextOverlay, totalDuration));
      },
    [onChange, textOverlay, totalDuration],
  );

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-text-tertiary">
        <span>{formatDuration(textOverlay.startTime)}</span>
        <span>{formatDuration(textOverlay.endTime)}</span>
      </div>
      <div
        ref={timelineRef}
        className="relative h-10 rounded-lg bg-slate-100"
      >
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-5 w-px -translate-y-1/2 bg-slate-400"
          style={{ left: `calc(${boundaryPercent}% - 1px)` }}
        />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-accent"
          style={{
            left: `${startPercent}%`,
            right: `${100 - endPercent}%`,
          }}
        />
        <div
          className="absolute top-1/2 h-7 w-px -translate-y-1/2 bg-text-primary"
          style={{ left: `calc(${playheadPercent}% - 1px)` }}
        />
        <button
          type="button"
          aria-label="Text start time"
          className="absolute top-1/2 h-7 w-4 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-white bg-accent shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          style={{ left: `${startPercent}%` }}
          onKeyDown={handleKeyDown("start")}
          onPointerDown={handlePointerDown("start")}
        />
        <button
          type="button"
          aria-label="Text end time"
          className="absolute top-1/2 h-7 w-4 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-white bg-accent shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          style={{ left: `${endPercent}%` }}
          onKeyDown={handleKeyDown("end")}
          onPointerDown={handlePointerDown("end")}
        />
      </div>
    </div>
  );
}
