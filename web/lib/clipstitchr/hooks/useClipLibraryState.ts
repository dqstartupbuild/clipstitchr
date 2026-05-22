"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  useConvex,
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { createLongrVideoMetadataFromConvexDocument } from "@/lib/clipstitchr/backend/createLongrVideoMetadataFromConvexDocument";
import { createLongrVideoFromConvexDocument } from "@/lib/clipstitchr/backend/createLongrVideoFromConvexDocument";
import { createStitchFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchFromConvexDocument";
import { createVideoClipFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipFromConvexDocument";
import { createVideoClipMetadataFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipMetadataFromConvexDocument";
import { getDefinedR2Objects } from "@/lib/clipstitchr/backend/getDefinedR2Objects";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { downloadCachedR2ImageBlobs } from "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { generateCliprMusic as requestCliprMusicGeneration } from "@/lib/clipstitchr/client/generateCliprMusic";
import { generateStitchMusic as requestStitchMusicGeneration } from "@/lib/clipstitchr/client/generateStitchMusic";
import { libraryMetadataPageSize } from "@/lib/clipstitchr/constants/libraryMetadataPageSize";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ClipLibraryCounts } from "@/lib/clipstitchr/types/ClipLibraryCounts";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { ClipLibraryValue } from "@/lib/clipstitchr/types/ClipLibraryValue";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getClipLibraryDisplayCounts } from "@/lib/clipstitchr/utils/getClipLibraryDisplayCounts";
import { getDeletableMusicAudioObject } from "@/lib/clipstitchr/utils/getDeletableMusicAudioObject";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type PendingPosterBlobLoad = {
  object: R2ObjectReference;
  promise: Promise<Blob | null>;
  resolve: (blob: Blob | null) => void;
};

export function useClipLibraryState(): ClipLibraryValue {
  const convex = useConvex();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const clipDocumentsQuery = usePaginatedQuery(
    api.videoClips.list,
    isAuthenticated ? { refreshNonce } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const stitchDocumentsQuery = usePaginatedQuery(
    api.stitches.list,
    isAuthenticated ? { refreshNonce } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const longrVideoDocumentsQuery = usePaginatedQuery(
    api.longrVideos.list,
    isAuthenticated ? { refreshNonce } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const aggregateCounts = useQuery(
    api.libraryCounts.get,
    isAuthenticated ? { refreshNonce } : "skip",
  );
  const clipDocuments = clipDocumentsQuery.results;
  const stitchDocuments = stitchDocumentsQuery.results;
  const longrVideoDocuments = longrVideoDocumentsQuery.results;
  const updateClipMetadataMutation = useMutation(api.videoClips.updateMetadata);
  const updateCliprMusicMutation = useMutation(api.videoClips.updateCliprMusic);
  const updateStitchMusicMutation = useMutation(api.stitches.updateMusic);
  const updateStitchTextOverlayMutation = useMutation(
    api.stitches.updateTextOverlay,
  );
  const removeClipMutation = useMutation(api.videoClips.remove);
  const removeLongrVideoMutation = useMutation(api.longrVideos.remove);
  const removeStitchMutation = useMutation(api.stitches.remove);
  const clipCacheRef = useRef(new Map<string, VideoClip>());
  const longrVideoCacheRef = useRef(new Map<string, LongrVideo>());
  const posterBlobCacheRef = useRef(new Map<string, Blob>());
  const pendingPosterBlobLoadsRef = useRef(
    new Map<string, PendingPosterBlobLoad>(),
  );
  const queuedPosterBlobLoadKeysRef = useRef(new Set<string>());
  const isPosterBlobFlushScheduledRef = useRef(false);
  const clips = useMemo(
    () => clipDocuments.map((clip) => createVideoClipMetadataFromConvexDocument(clip)),
    [clipDocuments],
  );
  const stitches = useMemo(
    () =>
      stitchDocuments.map((stitch) =>
        createStitchFromConvexDocument({ stitch }),
      ),
    [stitchDocuments],
  );
  const longrVideos = useMemo(
    () =>
      longrVideoDocuments.map((longrVideo) =>
        createLongrVideoMetadataFromConvexDocument(longrVideo),
      ),
    [longrVideoDocuments],
  );
  const loadedCounts = useMemo<ClipLibraryCounts>(
    () => ({
      cliprClips: clips.filter((clip) => Boolean(clip.cliprMetadata)).length,
      demoClips: clips.filter((clip) => clip.clipType === "demo").length,
      longrVideos: longrVideos.length,
      stitches: stitches.length,
      swapClips: clips.filter(
        (clip) => clip.swaprMetadata?.source === "swapr",
      ).length,
      ugcClips: clips.filter(
        (clip) =>
          clip.clipType === "ugc" &&
          !clip.cliprMetadata &&
          clip.swaprMetadata?.source !== "swapr",
      ).length,
    }),
    [clips, longrVideos.length, stitches.length],
  );
  const counts = getClipLibraryDisplayCounts(aggregateCounts, loadedCounts);

  const refresh = useCallback(async () => {
    setError(null);
    setRefreshNonce((currentNonce) => currentNonce + 1);
  }, []);

  const flushQueuedPosterBlobLoads = useCallback(() => {
    isPosterBlobFlushScheduledRef.current = false;

    const queuedKeys = [...queuedPosterBlobLoadKeysRef.current];

    queuedPosterBlobLoadKeysRef.current.clear();

    const posterObjects = queuedKeys
      .map((key) => pendingPosterBlobLoadsRef.current.get(key)?.object)
      .filter((object): object is R2ObjectReference => Boolean(object));

    if (posterObjects.length === 0) {
      return;
    }

    void downloadCachedR2ImageBlobs(posterObjects)
      .then((posterBlobsByKey) => {
        for (const posterObject of posterObjects) {
          const pendingLoad = pendingPosterBlobLoadsRef.current.get(
            posterObject.key,
          );

          if (!pendingLoad) {
            continue;
          }

          const posterBlob = posterBlobsByKey.get(posterObject.key) ?? null;

          if (posterBlob) {
            posterBlobCacheRef.current.set(posterObject.key, posterBlob);
          }

          pendingLoad.resolve(posterBlob);
          pendingPosterBlobLoadsRef.current.delete(posterObject.key);
        }
      })
      .catch(() => {
        for (const posterObject of posterObjects) {
          const pendingLoad = pendingPosterBlobLoadsRef.current.get(
            posterObject.key,
          );

          if (!pendingLoad) {
            continue;
          }

          pendingLoad.resolve(null);
          pendingPosterBlobLoadsRef.current.delete(posterObject.key);
        }
      });
  }, []);

  const schedulePosterBlobLoadFlush = useCallback(() => {
    if (isPosterBlobFlushScheduledRef.current) {
      return;
    }

    isPosterBlobFlushScheduledRef.current = true;
    void Promise.resolve().then(flushQueuedPosterBlobLoads);
  }, [flushQueuedPosterBlobLoads]);

  const loadPosterBlob = useCallback(
    async (posterObject?: R2ObjectReference) => {
      if (!posterObject) {
        return null;
      }

      const cachedPosterBlob = posterBlobCacheRef.current.get(posterObject.key);

      if (cachedPosterBlob) {
        return cachedPosterBlob;
      }

      const pendingLoad = pendingPosterBlobLoadsRef.current.get(
        posterObject.key,
      );

      if (pendingLoad) {
        return await pendingLoad.promise;
      }

      let resolvePendingLoad: (blob: Blob | null) => void = () => undefined;
      const promise = new Promise<Blob | null>((resolve) => {
        resolvePendingLoad = resolve;
      });

      pendingPosterBlobLoadsRef.current.set(posterObject.key, {
        object: posterObject,
        promise,
        resolve: resolvePendingLoad,
      });
      queuedPosterBlobLoadKeysRef.current.add(posterObject.key);
      schedulePosterBlobLoadFlush();

      return await promise;
    },
    [schedulePosterBlobLoadFlush],
  );

  const loadClip = useCallback(async (id: string) => {
    const cachedClip = clipCacheRef.current.get(id);

    if (cachedClip) {
      return cachedClip;
    }

    const clipDocument =
      clipDocuments?.find((clip) => clip.id === id) ??
      (await convex.query(api.videoClips.get, { id }));

    if (!clipDocument) {
      return null;
    }

    const [blob, posterBlob] = await Promise.all([
      downloadBlobFromR2(clipDocument.videoObject),
      loadPosterBlob(clipDocument.posterObject),
    ]);
    const clip = createVideoClipFromConvexDocument({
      clip: clipDocument,
      blob,
      posterBlob: posterBlob ?? undefined,
    });

    clipCacheRef.current.set(id, clip);
    return clip;
  }, [convex, clipDocuments, loadPosterBlob]);

  const loadClipPoster = useCallback(async (id: string) => {
    const clipDocument =
      clipDocuments.find((clip) => clip.id === id) ??
      (await convex.query(api.videoClips.get, { id }));

    if (!clipDocument) {
      return null;
    }

    return await loadPosterBlob(clipDocument.posterObject);
  }, [clipDocuments, convex, loadPosterBlob]);

  const loadStitchPoster = useCallback(async (id: string) => {
    const stitchDocument =
      stitchDocuments.find((stitch) => stitch.id === id) ??
      (await convex.query(api.stitches.get, { id }));

    if (!stitchDocument) {
      return null;
    }

    if (stitchDocument.posterObject) {
      return await loadPosterBlob(stitchDocument.posterObject);
    }

    const ugcClipDocument =
      clipDocuments.find((clip) => clip.id === stitchDocument.ugcClipId) ??
      (await convex.query(api.videoClips.get, {
        id: stitchDocument.ugcClipId,
      }));

    return await loadPosterBlob(ugcClipDocument?.posterObject);
  }, [clipDocuments, convex, loadPosterBlob, stitchDocuments]);

  const loadLongrPoster = useCallback(async (id: string) => {
    const longrVideoDocument =
      longrVideoDocuments.find((longrVideo) => longrVideo.id === id) ??
      (await convex.query(api.longrVideos.get, { id }));

    if (!longrVideoDocument) {
      return null;
    }

    return await loadPosterBlob(longrVideoDocument.posterObject);
  }, [convex, loadPosterBlob, longrVideoDocuments]);

  const loadLongrVideo = useCallback(async (id: string) => {
    const cachedLongrVideo = longrVideoCacheRef.current.get(id);

    if (cachedLongrVideo) {
      return cachedLongrVideo;
    }

    const longrVideoDocument =
      longrVideoDocuments.find((longrVideo) => longrVideo.id === id) ??
      (await convex.query(api.longrVideos.get, { id }));

    if (!longrVideoDocument) {
      return null;
    }

    const [blob, posterBlob] = await Promise.all([
      downloadBlobFromR2(longrVideoDocument.longrObject),
      loadPosterBlob(longrVideoDocument.posterObject),
    ]);
    const longrVideo = createLongrVideoFromConvexDocument({
      longrVideo: longrVideoDocument,
      blob,
      posterBlob: posterBlob ?? undefined,
    });

    longrVideoCacheRef.current.set(id, longrVideo);
    return longrVideo;
  }, [convex, loadPosterBlob, longrVideoDocuments]);

  const removeClip = useCallback(
    async (id: string) => {
      const clipDocument =
        clipDocuments?.find((clip) => clip.id === id) ??
        (await convex.query(api.videoClips.get, { id }));

      if (clipDocument) {
        await deleteObjectsFromR2(
          getDefinedR2Objects([
            clipDocument.videoObject,
            clipDocument.posterObject,
            clipDocument.cliprMetadata?.music
              ? getDeletableMusicAudioObject({
                  audioObject: clipDocument.cliprMetadata.music.audioObject,
                })
              : undefined,
          ]),
        );
      }

      await removeClipMutation({ id });
      clipCacheRef.current.delete(id);
      await refresh();
    },
    [clipDocuments, convex, refresh, removeClipMutation],
  );

  const renameClip = useCallback(
    async (clip: VideoClipMetadata, name: string) => {
      const updatedClip = {
        ...clip,
        name,
        updatedAt: new Date().toISOString(),
      };

      await updateClipMetadataMutation({
        id: clip.id,
        name: updatedClip.name,
        updatedAt: updatedClip.updatedAt,
      });
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh, updateClipMetadataMutation],
  );

  const updateClipMetadata = useCallback(
    async (clip: VideoClipMetadata, metadata: AssetMetadataUpdate) => {
      const updatedClip = {
        ...clip,
        name: metadata.name,
        tags: normalizeAssetTagsWithRequiredTag(metadata.tags, clip.clipType),
        ...(metadata.videoDescription === undefined
          ? {}
          : { videoDescription: metadata.videoDescription }),
        ...(metadata.mainPersonDescription === undefined
          ? {}
          : { mainPersonDescription: metadata.mainPersonDescription }),
        ...(metadata.outfitDescription === undefined
          ? {}
          : { outfitDescription: metadata.outfitDescription }),
        ...(metadata.locationDescription === undefined
          ? {}
          : { locationDescription: metadata.locationDescription }),
        ...(metadata.poseDescription === undefined
          ? {}
          : { poseDescription: metadata.poseDescription }),
        ...(metadata.productDescription === undefined
          ? {}
          : { productDescription: metadata.productDescription }),
        ...(metadata.productId === undefined
          ? {}
          : { productId: metadata.productId }),
        updatedAt: new Date().toISOString(),
      };

      await updateClipMetadataMutation({
        id: clip.id,
        name: updatedClip.name,
        tags: updatedClip.tags ?? [],
        videoDescription: updatedClip.videoDescription,
        mainPersonDescription: updatedClip.mainPersonDescription,
        outfitDescription: updatedClip.outfitDescription,
        locationDescription: updatedClip.locationDescription,
        poseDescription: updatedClip.poseDescription,
        productDescription: updatedClip.productDescription,
        ...(metadata.productId === undefined
          ? {}
          : { productId: updatedClip.productId }),
        updatedAt: updatedClip.updatedAt,
      });
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh, updateClipMetadataMutation],
  );

  const updateClipTrimRange = useCallback(
    async (clip: VideoClipMetadata, defaultTrimRange: VideoTrimRange) => {
      const updatedClip = {
        ...clip,
        defaultTrimRange: clampVideoTrimRange(defaultTrimRange, clip.duration),
        updatedAt: new Date().toISOString(),
      };

      await updateClipMetadataMutation({
        id: clip.id,
        defaultTrimRange: updatedClip.defaultTrimRange,
        updatedAt: updatedClip.updatedAt,
      });
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh, updateClipMetadataMutation],
  );

  const updateCliprMusic = useCallback(
    async (clip: VideoClipMetadata, music: CliprMusicMetadata | null) => {
      const previousMusicObject = clip.cliprMetadata?.music?.audioObject;
      const nextUpdatedAt = new Date().toISOString();

      await updateCliprMusicMutation({
        id: clip.id,
        music:
          music === null
            ? null
            : {
                ...music,
                updatedAt: nextUpdatedAt,
              },
        updatedAt: nextUpdatedAt,
      });

      if (
        previousMusicObject &&
        previousMusicObject.key.startsWith("users/") &&
        (!music || previousMusicObject.key !== music.audioObject.key)
      ) {
        await deleteObjectsFromR2([previousMusicObject]).catch(() => null);
      }

      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh, updateCliprMusicMutation],
  );

  const generateCliprMusic = useCallback(
    async (clip: VideoClipMetadata) => {
      if (!clip.cliprMetadata) {
        return null;
      }

      const music = await requestCliprMusicGeneration({ clipId: clip.id });

      await updateCliprMusic(clip, music);

      return music;
    },
    [updateCliprMusic],
  );

  const updateStitchMusic = useCallback(
    async (stitch: Stitch, music: StitchMusicMetadata | null) => {
      const previousMusicObject = stitch.music?.audioObject;
      const nextUpdatedAt = new Date().toISOString();

      await updateStitchMusicMutation({
        id: stitch.id,
        music:
          music === null
            ? null
            : {
                ...music,
                updatedAt: nextUpdatedAt,
              },
      });

      if (
        previousMusicObject &&
        previousMusicObject.key.startsWith("users/") &&
        (!music || previousMusicObject.key !== music.audioObject.key)
      ) {
        await deleteObjectsFromR2([previousMusicObject]).catch(() => null);
      }

      await refresh();
    },
    [refresh, updateStitchMusicMutation],
  );

  const updateStitchTextOverlay = useCallback(
    async (stitch: Stitch, textOverlay: TextOverlay | null) => {
      await updateStitchTextOverlayMutation({
        id: stitch.id,
        textOverlay,
      });

      await refresh();
    },
    [refresh, updateStitchTextOverlayMutation],
  );

  const generateStitchMusic = useCallback(
    async (stitch: Stitch) => {
      const music = await requestStitchMusicGeneration({
        stitchId: stitch.id,
      });

      await updateStitchMusic(stitch, music);

      return music;
    },
    [updateStitchMusic],
  );

  const removeStitch = useCallback(
    async (id: string) => {
      const stitchDocument =
        stitchDocuments?.find((stitch) => stitch.id === id) ??
        (await convex.query(api.stitches.get, { id }));

      if (stitchDocument) {
        await deleteObjectsFromR2(
          getDefinedR2Objects([
            stitchDocument.stitchObject,
            stitchDocument.posterObject,
            stitchDocument.music
              ? getDeletableMusicAudioObject({
                  audioObject: stitchDocument.music.audioObject,
                })
              : undefined,
          ]),
        );
      }

      await removeStitchMutation({ id });
      await refresh();
    },
    [convex, refresh, removeStitchMutation, stitchDocuments],
  );

  const removeLongrVideo = useCallback(
    async (id: string) => {
      const longrVideoDocument =
        longrVideoDocuments?.find((longrVideo) => longrVideo.id === id) ??
        (await convex.query(api.longrVideos.get, { id }));

      if (longrVideoDocument) {
        await deleteObjectsFromR2(
          getDefinedR2Objects([
            longrVideoDocument.longrObject,
            longrVideoDocument.posterObject,
          ]),
        );
      }

      await removeLongrVideoMutation({ id });
      longrVideoCacheRef.current.delete(id);
      await refresh();
    },
    [convex, longrVideoDocuments, refresh, removeLongrVideoMutation],
  );

  const loadMoreClips = useCallback(() => {
    if (clipDocumentsQuery.status === "CanLoadMore") {
      clipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [clipDocumentsQuery]);
  const loadMoreStitches = useCallback(() => {
    if (stitchDocumentsQuery.status === "CanLoadMore") {
      stitchDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [stitchDocumentsQuery]);
  const loadMoreLongrVideos = useCallback(() => {
    if (longrVideoDocumentsQuery.status === "CanLoadMore") {
      longrVideoDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [longrVideoDocumentsQuery]);
  const isLoadingFirstPage =
    isAuthenticated &&
    (clipDocumentsQuery.status === "LoadingFirstPage" ||
      stitchDocumentsQuery.status === "LoadingFirstPage" ||
      longrVideoDocumentsQuery.status === "LoadingFirstPage");

  return {
    clips,
    counts,
    longrVideos,
    stitches,
    isLoading: isAuthLoading || isLoadingFirstPage,
    hasMoreClips: clipDocumentsQuery.status === "CanLoadMore",
    hasMoreLongrVideos: longrVideoDocumentsQuery.status === "CanLoadMore",
    hasMoreStitches: stitchDocumentsQuery.status === "CanLoadMore",
    isLoadingMoreClips: clipDocumentsQuery.status === "LoadingMore",
    isLoadingMoreLongrVideos:
      longrVideoDocumentsQuery.status === "LoadingMore",
    isLoadingMoreStitches: stitchDocumentsQuery.status === "LoadingMore",
    error,
    refresh,
    loadClip,
    loadClipPoster,
    loadLongrPoster,
    loadLongrVideo,
    loadMoreClips,
    loadMoreLongrVideos,
    loadMoreStitches,
    loadStitchPoster,
    removeClip,
    renameClip,
    updateClipMetadata,
    generateCliprMusic,
    updateCliprMusic,
    updateClipTrimRange,
    generateStitchMusic,
    updateStitchMusic,
    updateStitchTextOverlay,
    removeLongrVideo,
    removeStitch,
  };
}
