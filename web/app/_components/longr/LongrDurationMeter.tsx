"use client";

import { longrMaxDurationSeconds } from "@/lib/clipstitchr/constants/longrMaxDurationSeconds";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type LongrDurationMeterProps = {
  duration: number;
};

export function LongrDurationMeter({ duration }: LongrDurationMeterProps) {
  const remaining = Math.max(0, longrMaxDurationSeconds - duration);
  const progress = Math.min(100, (duration / longrMaxDurationSeconds) * 100);

  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span className="text-text-primary">{formatDuration(duration)}</span>
        <span className="text-text-tertiary">
          {formatDuration(remaining)} left
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
