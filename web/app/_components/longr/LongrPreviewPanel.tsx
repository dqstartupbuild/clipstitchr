"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/app/_components/ui/Panel";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type LongrPreviewPanelProps = {
  clips: VideoClipMetadata[];
  onLoadClip: (id: string) => Promise<VideoClip | null>;
};

export function LongrPreviewPanel({
  clips,
  onLoadClip,
}: LongrPreviewPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeClip, setActiveClip] = useState<VideoClip | null>(null);
  const boundedActiveIndex = clips.length
    ? Math.min(activeIndex, clips.length - 1)
    : 0;
  const selectedClip = clips[boundedActiveIndex] ?? null;
  const previewClip = activeClip?.id === selectedClip?.id ? activeClip : null;
  const videoUrl = useObjectUrl(previewClip?.blob);
  const posterUrl = useObjectUrl(selectedClip?.posterBlob);

  useEffect(() => {
    let isCancelled = false;

    if (!selectedClip) {
      return;
    }

    void onLoadClip(selectedClip.id).then((clip) => {
      if (!isCancelled) {
        setActiveClip(clip);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [onLoadClip, selectedClip]);

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border p-4">
        <p className="text-sm font-semibold text-accent-dark">Preview</p>
        <h2 className="mt-0.5 text-base font-bold text-text-primary">
          {selectedClip ? selectedClip.name : "No clips selected"}
        </h2>
      </div>
      <div className="mx-auto max-w-[340px] bg-slate-950">
        {selectedClip ? (
          <video
            key={selectedClip.id}
            className="aspect-[9/16] w-full bg-slate-950 object-contain"
            src={videoUrl ?? undefined}
            poster={posterUrl ?? undefined}
            controls
            playsInline
            onEnded={() =>
              setActiveIndex((currentIndex) =>
                clips.length ? (currentIndex + 1) % clips.length : 0,
              )
            }
          />
        ) : (
          <div className="flex aspect-[9/16] items-center justify-center px-8 text-center text-sm font-semibold text-white/70">
            Select UGC or demo clips to preview the sequence.
          </div>
        )}
      </div>
      {clips.length ? (
        <div className="border-t border-border p-4">
          <p className="text-sm font-semibold text-text-secondary">
            {boundedActiveIndex + 1} of {clips.length}
          </p>
        </div>
      ) : null}
    </Panel>
  );
}
