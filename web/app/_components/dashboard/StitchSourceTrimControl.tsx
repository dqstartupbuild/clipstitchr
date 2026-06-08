"use client";

import { useId } from "react";
import { VideoTrimRangeSlider } from "@/app/_components/trim/VideoTrimRangeSlider";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type StitchSourceTrimControlProps = {
  duration: number;
  title: string;
  value: VideoTrimRange;
  onChange: (trimRange: VideoTrimRange) => void;
};

export function StitchSourceTrimControl({
  duration,
  title,
  value,
  onChange,
}: StitchSourceTrimControlProps) {
  const sliderId = useId();

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-surface-elevated p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
        {title}
      </p>
      <div className="mt-3">
        <VideoTrimRangeSlider
          id={sliderId}
          duration={duration}
          value={value}
          onChange={onChange}
        />
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-text-tertiary">
        <span>Start {formatDuration(value.start)}</span>
        <span>End {formatDuration(value.end)}</span>
      </div>
    </div>
  );
}
