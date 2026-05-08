"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClipLibraryPosterBackfill } from "@/lib/clipstitchr/hooks/useClipLibraryPosterBackfill";
import { deleteStitch } from "@/lib/clipstitchr/storage/deleteStitch";
import { deleteVideoClip } from "@/lib/clipstitchr/storage/deleteVideoClip";
import { getStitches } from "@/lib/clipstitchr/storage/getStitches";
import { getVideoClip } from "@/lib/clipstitchr/storage/getVideoClip";
import { getVideoClips } from "@/lib/clipstitchr/storage/getVideoClips";
import { saveVideoClipMetadata } from "@/lib/clipstitchr/storage/saveVideoClipMetadata";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ClipLibraryValue } from "@/lib/clipstitchr/types/ClipLibraryValue";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

export function useClipLibraryState(): ClipLibraryValue {
  const [clips, setClips] = useState<VideoClipMetadata[]>([]);
  const [stitches, setStitches] = useState<Stitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clipCacheRef = useRef(new Map<string, VideoClip>());

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

  const loadClip = useCallback(async (id: string) => {
    const cachedClip = clipCacheRef.current.get(id);

    if (cachedClip) {
      return cachedClip;
    }

    const clip = await getVideoClip(id);

    if (!clip) {
      return null;
    }

    clipCacheRef.current.set(id, clip);
    return clip;
  }, []);

  const removeClip = useCallback(
    async (id: string) => {
      await deleteVideoClip(id);
      clipCacheRef.current.delete(id);
      await refresh();
    },
    [refresh],
  );

  const renameClip = useCallback(
    async (clip: VideoClipMetadata, name: string) => {
      const updatedClip = {
        ...clip,
        name,
        updatedAt: new Date().toISOString(),
      };

      await saveVideoClipMetadata(updatedClip);
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh],
  );

  const updateClipMetadata = useCallback(
    async (clip: VideoClipMetadata, metadata: AssetMetadataUpdate) => {
      const updatedClip = {
        ...clip,
        name: metadata.name,
        tags: normalizeAssetTagsWithRequiredTag(metadata.tags, clip.clipType),
        updatedAt: new Date().toISOString(),
      };

      await saveVideoClipMetadata(updatedClip);
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh],
  );

  const updateClipTrimRange = useCallback(
    async (clip: VideoClipMetadata, defaultTrimRange: VideoTrimRange) => {
      const updatedClip = {
        ...clip,
        defaultTrimRange: clampVideoTrimRange(defaultTrimRange, clip.duration),
        updatedAt: new Date().toISOString(),
      };

      await saveVideoClipMetadata(updatedClip);
      clipCacheRef.current.delete(clip.id);
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
    loadClip,
  });

  return {
    clips,
    stitches,
    isLoading,
    error,
    refresh,
    loadClip,
    removeClip,
    renameClip,
    updateClipMetadata,
    updateClipTrimRange,
    removeStitch,
  };
}
