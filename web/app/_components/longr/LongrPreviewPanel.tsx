"use client";

import { useEffect, useMemo, useState } from "react";
import { LongrSequenceVideoPlayer } from "@/app/_components/longr/LongrSequenceVideoPlayer";
import { Panel } from "@/app/_components/ui/Panel";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";

type LongrPreviewPanelProps = {
  clips: VideoClipMetadata[];
  onLoadClip: (id: string) => Promise<VideoClip | null>;
};

export function LongrPreviewPanel({
  clips,
  onLoadClip,
}: LongrPreviewPanelProps) {
  const [loadedClipMap, setLoadedClipMap] = useState(
    () => new Map<string, VideoClip>(),
  );
  const selectedClipIds = clips.map((clip) => clip.id).join(":");
  const loadedClips = useMemo(
    () =>
      clips.flatMap((clip) => {
        const loadedClip = loadedClipMap.get(clip.id);
        return loadedClip ? [loadedClip] : [];
      }),
    [clips, loadedClipMap],
  );
  const trimRanges = useMemo(
    () => clips.map((clip) => getDefaultVideoTrimRange(clip)),
    [clips],
  );
  const isLoadingSequence =
    clips.length > 0 && loadedClips.length !== clips.length;

  useEffect(() => {
    let isCancelled = false;

    if (!clips.length) {
      void Promise.resolve().then(() => {
        if (!isCancelled) {
          setLoadedClipMap(new Map());
        }
      });

      return () => {
        isCancelled = true;
      };
    }

    void Promise.all(
      clips.map(async (clip) => ({
        clip: await onLoadClip(clip.id),
        id: clip.id,
      })),
    ).then((entries) => {
      if (!isCancelled) {
        setLoadedClipMap(
          new Map(
            entries.flatMap((entry) =>
              entry.clip ? [[entry.id, entry.clip] as const] : [],
            ),
          ),
        );
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [clips, onLoadClip, selectedClipIds]);

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border p-4">
        <p className="text-sm font-semibold text-accent-dark">Preview</p>
        <h2 className="mt-0.5 text-base font-bold text-text-primary">
          {clips.length ? `${clips.length} clips selected` : "No clips selected"}
        </h2>
      </div>
      {clips.length ? (
        isLoadingSequence ? (
          <div className="p-4">
            <div className="mx-auto flex aspect-[9/16] w-full max-w-[340px] items-center justify-center rounded-lg bg-slate-950 px-8 text-center text-sm font-semibold text-white/70">
              Loading preview
            </div>
          </div>
        ) : (
          <LongrSequenceVideoPlayer
            clips={loadedClips}
            trimRanges={trimRanges}
          />
        )
      ) : (
        <div className="p-4">
          <div className="mx-auto flex aspect-[9/16] w-full max-w-[340px] items-center justify-center rounded-lg bg-slate-950 px-8 text-center text-sm font-semibold text-white/70">
            Select UGC or demo clips to preview the sequence.
          </div>
        </div>
      )}
      {clips.length ? (
        <div className="border-t border-border p-4">
          <p className="text-sm font-semibold text-text-secondary">
            {clips.length} clips in play order
          </p>
        </div>
      ) : null}
    </Panel>
  );
}
