"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteCreatedVideo } from "@/lib/clipr/storage/deleteCreatedVideo";
import { deleteVideoClip } from "@/lib/clipr/storage/deleteVideoClip";
import { getCreatedVideos } from "@/lib/clipr/storage/getCreatedVideos";
import { getVideoClips } from "@/lib/clipr/storage/getVideoClips";
import { saveVideoClip } from "@/lib/clipr/storage/saveVideoClip";
import type { CreatedVideo } from "@/lib/clipr/types/CreatedVideo";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

export function useClipLibrary() {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [createdVideos, setCreatedVideos] = useState<CreatedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextClips, nextCreatedVideos] = await Promise.all([
        getVideoClips(),
        getCreatedVideos(),
      ]);
      setClips(nextClips);
      setCreatedVideos(nextCreatedVideos);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load the local Clipr library.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeClip = useCallback(
    async (id: string) => {
      await deleteVideoClip(id);
      await refresh();
    },
    [refresh],
  );

  const renameClip = useCallback(
    async (clip: VideoClip, name: string) => {
      await saveVideoClip({
        ...clip,
        name,
        updatedAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh],
  );

  const removeCreatedVideo = useCallback(
    async (id: string) => {
      await deleteCreatedVideo(id);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return {
    clips,
    createdVideos,
    isLoading,
    error,
    refresh,
    removeClip,
    renameClip,
    removeCreatedVideo,
  };
}
