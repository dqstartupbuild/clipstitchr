"use client";

import { useCallback, useMemo, useState } from "react";
import { SequenceVideoPlayer } from "@/app/_components/create/SequenceVideoPlayer";
import { TextOverlayEditor } from "@/app/_components/create/TextOverlayEditor";
import { Panel } from "@/app/_components/ui/Panel";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type SequencePreviewPanelProps = {
  ugcClip: VideoClip | null;
  demoClip: VideoClip | null;
  textOverlay: TextOverlay | null;
  onTextOverlayChange: (textOverlay: TextOverlay | null) => void;
};

export function SequencePreviewPanel({
  ugcClip,
  demoClip,
  textOverlay,
  onTextOverlayChange,
}: SequencePreviewPanelProps) {
  const [playbackTime, setPlaybackTime] = useState(0);
  const totalDuration = useMemo(
    () => (ugcClip?.duration ?? 0) + (demoClip?.duration ?? 0),
    [demoClip?.duration, ugcClip?.duration],
  );
  const handleOverlayChange = useCallback(
    (nextTextOverlay: TextOverlay) => {
      onTextOverlayChange(nextTextOverlay);
    },
    [onTextOverlayChange],
  );

  return (
    <Panel className="p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-accent-dark">Preview</p>
        <h2 className="mt-2 text-xl font-bold text-text-primary">
          UGC then Demo
        </h2>
      </div>
      {ugcClip && demoClip ? (
        <>
          <SequenceVideoPlayer
            key={`${ugcClip.id}:${demoClip.id}`}
            ugcClip={ugcClip}
            demoClip={demoClip}
            textOverlay={textOverlay}
            totalDuration={totalDuration}
            onTextOverlayChange={handleOverlayChange}
            onPlaybackTimeChange={setPlaybackTime}
          />
          <TextOverlayEditor
            textOverlay={textOverlay}
            totalDuration={totalDuration}
            ugcDuration={ugcClip.duration}
            currentTime={playbackTime}
            onChange={onTextOverlayChange}
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center text-sm text-text-secondary">
          Select both clips to preview the sequence.
        </div>
      )}
    </Panel>
  );
}
