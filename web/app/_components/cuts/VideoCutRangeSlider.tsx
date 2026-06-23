"use client";

import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";

type VideoCutRangeSliderProps = {
  id: string;
  duration: number;
  value: VideoTrimRange;
  onChange: (range: VideoTrimRange) => void;
};

export function VideoCutRangeSlider({
  id,
  duration,
  value,
  onChange,
}: VideoCutRangeSliderProps) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const isDisabled = safeDuration <= 0;
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
    <div className="relative h-11 min-w-0 max-w-full">
      <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
      <div
        aria-hidden
        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-red-500"
        style={{
          left: `${startPercent}%`,
          right: `${100 - endPercent}%`,
        }}
      />
      <input
        id={`${id}-start`}
        aria-label="Cut start"
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
        aria-label="Cut end"
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
