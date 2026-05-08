"use client";

import { useEffect, useState } from "react";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type UseLoadedVideoClipOptions = {
  clipId: string | null;
  loadClip: (id: string) => Promise<VideoClip | null>;
};

export function useLoadedVideoClip({
  clipId,
  loadClip,
}: UseLoadedVideoClipOptions) {
  const [loadedClip, setLoadedClip] = useState<{
    clipId: string;
    clip: VideoClip | null;
  } | null>(null);

  useEffect(() => {
    let isCanceled = false;

    if (!clipId) {
      return () => {
        isCanceled = true;
      };
    }

    void loadClip(clipId)
      .then((loadedClip) => {
        if (!isCanceled) {
          setLoadedClip({
            clipId,
            clip: loadedClip,
          });
        }
      });

    return () => {
      isCanceled = true;
    };
  }, [clipId, loadClip]);

  const clip = loadedClip?.clipId === clipId ? loadedClip.clip : null;

  return {
    clip,
    isLoading: Boolean(clipId && loadedClip?.clipId !== clipId),
  };
}
