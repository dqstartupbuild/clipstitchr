"use client";

import { useCallback, useEffect, useState } from "react";
import { useClipLibraryPosterBackfill } from "@/lib/clipstitchr/hooks/useClipLibraryPosterBackfill";
import { deleteStitch } from "@/lib/clipstitchr/storage/deleteStitch";
import { deleteVideoClip } from "@/lib/clipstitchr/storage/deleteVideoClip";
import { getStitches } from "@/lib/clipstitchr/storage/getStitches";
import { getVideoClips } from "@/lib/clipstitchr/storage/getVideoClips";
import { saveVideoClip } from "@/lib/clipstitchr/storage/saveVideoClip";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

export function useClipLibrary() {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [stitches, setStitches] = useState<Stitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextClips, nextStitches] = await Promise.all([
        getVideoClips(),
        getStitches(),
      ]);
      setClips(nextClips);
      setStitches(nextStitches);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load the local ClipStitchr library.",
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

  const updateClipMetadata = useCallback(
    async (clip: VideoClip, metadata: AssetMetadataUpdate) => {
      await saveVideoClip({
        ...clip,
        name: metadata.name,
        tags: normalizeAssetTagsWithRequiredTag(metadata.tags, clip.clipType),
        updatedAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh],
  );

  const updateClipTrimRange = useCallback(
    async (clip: VideoClip, defaultTrimRange: VideoTrimRange) => {
      await saveVideoClip({
        ...clip,
        defaultTrimRange: clampVideoTrimRange(defaultTrimRange, clip.duration),
        updatedAt: new Date().toISOString(),
      });
      await refresh();
    },
    [refresh],
  );

  const removeStitch = useCallback(
    async (id: string) => {
      await deleteStitch(id);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  useClipLibraryPosterBackfill({
    clips,
    stitches,
    setClips,
    setStitches,
  });

  return {
    clips,
    stitches,
    isLoading,
    error,
    refresh,
    removeClip,
    renameClip,
    updateClipMetadata,
    updateClipTrimRange,
    removeStitch,
  };
}
