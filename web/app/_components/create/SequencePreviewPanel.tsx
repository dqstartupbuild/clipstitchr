"use client";

import { SequenceVideoPlayer } from "@/app/_components/create/SequenceVideoPlayer";
import { Panel } from "@/app/_components/ui/Panel";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type SequencePreviewPanelProps = {
  ugcClip: VideoClip | null;
  demoClip: VideoClip | null;
};

export function SequencePreviewPanel({
  ugcClip,
  demoClip,
}: SequencePreviewPanelProps) {
  return (
    <Panel className="p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-accent-dark">Preview</p>
        <h2 className="mt-2 text-xl font-bold text-text-primary">
          UGC then Demo
        </h2>
      </div>
      {ugcClip && demoClip ? (
        <SequenceVideoPlayer ugcClip={ugcClip} demoClip={demoClip} />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center text-sm text-text-secondary">
          Select both clips to preview the sequence.
        </div>
      )}
    </Panel>
  );
}
