"use client";

import { SourcePlaybackRateControls } from "@/app/_components/controls/SourcePlaybackRateControls";
import { VideoCutEditor } from "@/app/_components/cuts/VideoCutEditor";
import { StitchSourceClipSelect } from "@/app/_components/dashboard/StitchSourceClipSelect";
import { StitchSourceTrimControl } from "@/app/_components/dashboard/StitchSourceTrimControl";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type StitchSourceSettingsPanelProps = {
  demoClips: VideoClipMetadata[];
  demoFallbackClip: {
    id: string;
    name: string;
  };
  demoPlaybackRate: VideoPlaybackRate;
  demoRemoveRanges: QuickEditRemoveRange[];
  demoTrimDuration: number;
  demoTrimRange: VideoTrimRange;
  error: string | null;
  selectedDemoClipId: string;
  selectedUgcClipId: string;
  totalDuration: number;
  ugcClips: VideoClipMetadata[];
  ugcFallbackClip: {
    id: string;
    name: string;
  };
  ugcPlaybackRate: VideoPlaybackRate;
  ugcRemoveRanges: QuickEditRemoveRange[];
  ugcTrimDuration: number;
  ugcTrimRange: VideoTrimRange;
  onDemoClipChange: (clipId: string) => void;
  onDemoPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
  onDemoRemoveRangesChange: (removeRanges: QuickEditRemoveRange[]) => void;
  onDemoTrimChange: (trimRange: VideoTrimRange) => void;
  onUgcClipChange: (clipId: string) => void;
  onUgcPlaybackRateChange: (playbackRate: VideoPlaybackRate) => void;
  onUgcRemoveRangesChange: (removeRanges: QuickEditRemoveRange[]) => void;
  onUgcTrimChange: (trimRange: VideoTrimRange) => void;
};

export function StitchSourceSettingsPanel({
  demoClips,
  demoFallbackClip,
  demoPlaybackRate,
  demoRemoveRanges,
  demoTrimDuration,
  demoTrimRange,
  error,
  selectedDemoClipId,
  selectedUgcClipId,
  totalDuration,
  ugcClips,
  ugcFallbackClip,
  ugcPlaybackRate,
  ugcRemoveRanges,
  ugcTrimDuration,
  ugcTrimRange,
  onDemoClipChange,
  onDemoPlaybackRateChange,
  onDemoRemoveRangesChange,
  onDemoTrimChange,
  onUgcClipChange,
  onUgcPlaybackRateChange,
  onUgcRemoveRangesChange,
  onUgcTrimChange,
}: StitchSourceSettingsPanelProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Sources</h3>
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {formatDuration(totalDuration)}
          </p>
        </div>
      </div>
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <StitchSourceClipSelect
          clips={ugcClips}
          fallbackClip={ugcFallbackClip}
          label="Hook/UGC clip"
          value={selectedUgcClipId}
          onChange={onUgcClipChange}
        />
        <StitchSourceClipSelect
          clips={demoClips}
          fallbackClip={demoFallbackClip}
          label="Demo clip"
          value={selectedDemoClipId}
          onChange={onDemoClipChange}
        />
      </div>
      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        <StitchSourceTrimControl
          duration={ugcTrimDuration}
          title="Hook/UGC trim"
          value={ugcTrimRange}
          onChange={onUgcTrimChange}
        />
        <StitchSourceTrimControl
          duration={demoTrimDuration}
          title="Demo trim"
          value={demoTrimRange}
          onChange={onDemoTrimChange}
        />
      </div>
      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        <VideoCutEditor
          duration={ugcTrimDuration}
          showActions={false}
          title="Hook/UGC cuts"
          trimRange={ugcTrimRange}
          value={ugcRemoveRanges}
          onChange={onUgcRemoveRangesChange}
        />
        <VideoCutEditor
          duration={demoTrimDuration}
          showActions={false}
          title="Demo cuts"
          trimRange={demoTrimRange}
          value={demoRemoveRanges}
          onChange={onDemoRemoveRangesChange}
        />
      </div>
      <SourcePlaybackRateControls
        demoPlaybackRate={demoPlaybackRate}
        ugcPlaybackRate={ugcPlaybackRate}
        onDemoPlaybackRateChange={onDemoPlaybackRateChange}
        onUgcPlaybackRateChange={onUgcPlaybackRateChange}
      />
    </section>
  );
}
