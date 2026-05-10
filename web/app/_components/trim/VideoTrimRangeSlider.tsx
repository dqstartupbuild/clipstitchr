"use client";

import { VIDEO_TRIM_MIN_DURATION } from "@/lib/clipstitchr/constants/videoTrimBounds";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";

type VideoTrimRangeSliderProps = {
  id: string;
  duration: number;
  value: VideoTrimRange;
  onChange: (trimRange: VideoTrimRange) => void;
};

export function VideoTrimRangeSlider({
  id,
  duration,
  value,
  onChange,
}: VideoTrimRangeSliderProps) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const isDisabled = safeDuration <= VIDEO_TRIM_MIN_DURATION;
  const startPercent = safeDuration > 0 ? (value.start / safeDuration) * 100 : 0;
  const endPercent = safeDuration > 0 ? (value.end / safeDuration) * 100 : 100;

  const updateStart = (start: number) => {
    onChange(
      clampVideoTrimRange(
        {
          ...value,
          start,
        },
        safeDuration,
      ),
    );
  };

  const updateEnd = (end: number) => {
    onChange(
      clampVideoTrimRange(
        {
          ...value,
          end,
        },
        safeDuration,
      ),
    );
  };

  return (
    <div className="relative h-11">
      <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
      <div
        aria-hidden
        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-accent"
        style={{
          left: `${startPercent}%`,
          right: `${100 - endPercent}%`,
        }}
      />
      <input
        id={`${id}-start`}
        aria-label="Trim start"
        type="range"
        min={0}
        max={safeDuration}
        step={0.1}
        value={value.start}
        className="video-trim-range-input"
        disabled={isDisabled}
        style={{ zIndex: 2 }}
        onChange={(event) => updateStart(Number(event.target.value))}
      />
      <input
        id={`${id}-end`}
        aria-label="Trim end"
        type="range"
        min={0}
        max={safeDuration}
        step={0.1}
        value={value.end}
        className="video-trim-range-input"
        disabled={isDisabled}
        style={{ zIndex: 3 }}
        onChange={(event) => updateEnd(Number(event.target.value))}
      />
    </div>
  );
}
