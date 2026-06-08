"use client";

import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";

type SourcePlaybackRateControlsProps = {
  demoPlaybackRate: VideoPlaybackRate;
  disabled?: boolean;
  ugcPlaybackRate: VideoPlaybackRate;
  onDemoPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
  onUgcPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
};

const playbackRateOptions = [1, 2] as const;

export function SourcePlaybackRateControls({
  demoPlaybackRate,
  disabled = false,
  ugcPlaybackRate,
  onDemoPlaybackRateChange,
  onUgcPlaybackRateChange,
}: SourcePlaybackRateControlsProps) {
  return (
    <section className="mt-4 min-w-0 border-t border-border pt-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-sm font-semibold text-accent-dark">Speed</h3>
        <div className="flex min-w-0 flex-wrap items-center gap-3 lg:justify-end">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-xs font-bold uppercase text-text-tertiary">
              UGC
            </span>
            <div
              aria-label="UGC playback speed"
              className="inline-flex rounded-lg border border-border bg-white p-0.5"
              role="group"
            >
              {playbackRateOptions.map((playbackRate) => (
                <button
                  key={`ugc-${playbackRate}`}
                  type="button"
                  aria-pressed={ugcPlaybackRate === playbackRate}
                  className={[
                    "h-8 min-w-11 rounded-md px-3 text-sm font-semibold transition-colors",
                    ugcPlaybackRate === playbackRate
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:bg-surface-muted",
                  ].join(" ")}
                  disabled={disabled}
                  onClick={() => onUgcPlaybackRateChange(playbackRate)}
                >
                  {playbackRate}x
                </button>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-xs font-bold uppercase text-text-tertiary">
              Demo
            </span>
            <div
              aria-label="Demo playback speed"
              className="inline-flex rounded-lg border border-border bg-white p-0.5"
              role="group"
            >
              {playbackRateOptions.map((playbackRate) => (
                <button
                  key={`demo-${playbackRate}`}
                  type="button"
                  aria-pressed={demoPlaybackRate === playbackRate}
                  className={[
                    "h-8 min-w-11 rounded-md px-3 text-sm font-semibold transition-colors",
                    demoPlaybackRate === playbackRate
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:bg-surface-muted",
                  ].join(" ")}
                  disabled={disabled}
                  onClick={() => onDemoPlaybackRateChange(playbackRate)}
                >
                  {playbackRate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
