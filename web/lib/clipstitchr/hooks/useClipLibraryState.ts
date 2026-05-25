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
import { createStitchFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchFromConvexDocument";
import { createVideoClipFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipFromConvexDocument";
import { createVideoClipMetadataFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipMetadataFromConvexDocument";
import { getDefinedR2Objects } from "@/lib/clipstitchr/backend/getDefinedR2Objects";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { downloadCachedR2ImageBlobs } from "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { generateCliprMusic as requestCliprMusicGeneration } from "@/lib/clipstitchr/client/generateCliprMusic";
import { generateStitchMusic as requestStitchMusicGeneration } from "@/lib/clipstitchr/client/generateStitchMusic";
import { libraryMetadataPageSize } from "@/lib/clipstitchr/constants/libraryMetadataPageSize";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createStitchPosterBlob } from "@/lib/clipstitchr/media/createStitchPosterBlob";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ClipLibraryCounts } from "@/lib/clipstitchr/types/ClipLibraryCounts";
import type { ClipLibrarySortOrder } from "@/lib/clipstitchr/types/ClipLibrarySortOrder";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { ClipLibraryValue } from "@/lib/clipstitchr/types/ClipLibraryValue";
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
  const [sortOrder, setSortOrder] =
    useState<ClipLibrarySortOrder>("newest");
  const clipDocumentsQuery = usePaginatedQuery(
    api.videoClips.list,
    isAuthenticated ? { refreshNonce, sortOrder } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const ugcClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    isAuthenticated ? { kind: "ugc", refreshNonce, sortOrder } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const cliprClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    isAuthenticated ? { kind: "clipr", refreshNonce, sortOrder } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const demoClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    isAuthenticated ? { kind: "demo", refreshNonce, sortOrder } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const swapClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    isAuthenticated ? { kind: "swapr", refreshNonce, sortOrder } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const stitchDocumentsQuery = usePaginatedQuery(
    api.stitches.list,
    isAuthenticated ? { refreshNonce, sortOrder } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const aggregateCounts = useQuery(
    api.libraryCounts.get,
    isAuthenticated ? { refreshNonce } : "skip",
  );
  const clipDocuments = clipDocumentsQuery.results;
  const ugcClipDocuments = ugcClipDocumentsQuery.results;
  const cliprClipDocuments = cliprClipDocumentsQuery.results;
  const demoClipDocuments = demoClipDocumentsQuery.results;
  const swapClipDocuments = swapClipDocumentsQuery.results;
  const stitchDocuments = stitchDocumentsQuery.results;
  const updateClipMetadataMutation = useMutation(api.videoClips.updateMetadata);
  const updateCliprMusicMutation = useMutation(api.videoClips.updateCliprMusic);
  const updateCliprTextOverlayMutation = useMutation(
    api.videoClips.updateCliprTextOverlay,
  );
  const updateStitchMusicMutation = useMutation(api.stitches.updateMusic);
  const updateStitchPosterMutation = useMutation(api.stitches.updatePoster);
  const updateStitchTextOverlayMutation = useMutation(
    api.stitches.updateTextOverlay,
  );
  const removeClipMutation = useMutation(api.videoClips.remove);
  const removeStitchMutation = useMutation(api.stitches.remove);
  const clipCacheRef = useRef(new Map<string, VideoClip>());
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
  const ugcClips = useMemo(
    () =>
      ugcClipDocuments.map((clip) =>
        createVideoClipMetadataFromConvexDocument(clip),
      ),
    [ugcClipDocuments],
  );
  const cliprClips = useMemo(
    () =>
      cliprClipDocuments.map((clip) =>
        createVideoClipMetadataFromConvexDocument(clip),
      ),
    [cliprClipDocuments],
  );
  const demoClips = useMemo(
    () =>
      demoClipDocuments.map((clip) =>
        createVideoClipMetadataFromConvexDocument(clip),
      ),
    [demoClipDocuments],
  );
  const swapClips = useMemo(
    () =>
      swapClipDocuments.map((clip) =>
        createVideoClipMetadataFromConvexDocument(clip),
      ),
    [swapClipDocuments],
  );
  const stitches = useMemo(
    () =>
      stitchDocuments.map((stitch) =>
        createStitchFromConvexDocument({ stitch }),
      ),
    [stitchDocuments],
  );
  const loadedCounts = useMemo<ClipLibraryCounts>(
    () => ({
      cliprClips: clips.filter((clip) => Boolean(clip.cliprMetadata)).length,
      demoClips: clips.filter((clip) => clip.clipType === "demo").length,
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
    [clips, stitches.length],
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

  const updateCliprTextOverlay = useCallback(
    async (clip: VideoClipMetadata, textOverlay: TextOverlay | null) => {
      const nextUpdatedAt = new Date().toISOString();

      await updateCliprTextOverlayMutation({
        id: clip.id,
        textOverlay,
        updatedAt: nextUpdatedAt,
      });

      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh, updateCliprTextOverlayMutation],
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
      let posterObject: R2ObjectReference | undefined;

      try {
        const [ugcClip, demoClip] = await Promise.all([
          loadClip(stitch.ugcClipId),
          loadClip(stitch.demoClipId),
        ]);

        if (ugcClip && demoClip) {
          const posterBlob = await createStitchPosterBlob({
            demoClip,
            demoTrimRange: stitch.demoTrimRange ?? {
              start: 0,
              end: demoClip.duration,
            },
            duration: stitch.duration,
            textOverlay,
            ugcClip,
            ugcTrimRange: stitch.ugcTrimRange ?? {
              start: 0,
              end: ugcClip.duration,
            },
          });

          [posterObject] = await uploadBlobsToR2([
            {
              blob: posterBlob,
              kind: "stitch-poster",
              recordId: stitch.id,
            },
          ]);
        }
      } catch {
        posterObject = undefined;
      }

      await updateStitchTextOverlayMutation({
        id: stitch.id,
        textOverlay,
      });

      if (posterObject) {
        await updateStitchPosterMutation({
          id: stitch.id,
          posterObject,
          posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
        });
        posterBlobCacheRef.current.delete(posterObject.key);
      }

      await refresh();
    },
    [
      loadClip,
      refresh,
      updateStitchPosterMutation,
      updateStitchTextOverlayMutation,
    ],
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

  const loadMoreClips = useCallback(() => {
    if (clipDocumentsQuery.status === "CanLoadMore") {
      clipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [clipDocumentsQuery]);
  const loadMoreUgcClips = useCallback(() => {
    if (ugcClipDocumentsQuery.status === "CanLoadMore") {
      ugcClipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [ugcClipDocumentsQuery]);
  const loadMoreCliprClips = useCallback(() => {
    if (cliprClipDocumentsQuery.status === "CanLoadMore") {
      cliprClipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [cliprClipDocumentsQuery]);
  const loadMoreDemoClips = useCallback(() => {
    if (demoClipDocumentsQuery.status === "CanLoadMore") {
      demoClipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [demoClipDocumentsQuery]);
  const loadMoreSwapClips = useCallback(() => {
    if (swapClipDocumentsQuery.status === "CanLoadMore") {
      swapClipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [swapClipDocumentsQuery]);
  const loadMoreStitches = useCallback(() => {
    if (stitchDocumentsQuery.status === "CanLoadMore") {
      stitchDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [stitchDocumentsQuery]);
  const isLoadingFirstPage =
    isAuthenticated &&
    (clipDocumentsQuery.status === "LoadingFirstPage" ||
      ugcClipDocumentsQuery.status === "LoadingFirstPage" ||
      cliprClipDocumentsQuery.status === "LoadingFirstPage" ||
      demoClipDocumentsQuery.status === "LoadingFirstPage" ||
      swapClipDocumentsQuery.status === "LoadingFirstPage" ||
      stitchDocumentsQuery.status === "LoadingFirstPage");

  return {
    clips,
    counts,
    stitches,
    sortOrder,
    videoGroups: {
      clipr: {
        clips: cliprClips,
        hasMoreItems: cliprClipDocumentsQuery.status === "CanLoadMore",
        isLoadingMoreItems: cliprClipDocumentsQuery.status === "LoadingMore",
        loadMoreItems: loadMoreCliprClips,
      },
      demo: {
        clips: demoClips,
        hasMoreItems: demoClipDocumentsQuery.status === "CanLoadMore",
        isLoadingMoreItems: demoClipDocumentsQuery.status === "LoadingMore",
        loadMoreItems: loadMoreDemoClips,
      },
      swapr: {
        clips: swapClips,
        hasMoreItems: swapClipDocumentsQuery.status === "CanLoadMore",
        isLoadingMoreItems: swapClipDocumentsQuery.status === "LoadingMore",
        loadMoreItems: loadMoreSwapClips,
      },
      ugc: {
        clips: ugcClips,
        hasMoreItems: ugcClipDocumentsQuery.status === "CanLoadMore",
        isLoadingMoreItems: ugcClipDocumentsQuery.status === "LoadingMore",
        loadMoreItems: loadMoreUgcClips,
      },
    },
    isLoading: isAuthLoading || isLoadingFirstPage,
    hasMoreClips: clipDocumentsQuery.status === "CanLoadMore",
    hasMoreStitches: stitchDocumentsQuery.status === "CanLoadMore",
    isLoadingMoreClips: clipDocumentsQuery.status === "LoadingMore",
    isLoadingMoreStitches: stitchDocumentsQuery.status === "LoadingMore",
    error,
    refresh,
    setSortOrder,
    loadClip,
    loadClipPoster,
    loadMoreClips,
    loadMoreStitches,
    loadStitchPoster,
    removeClip,
    renameClip,
    updateClipMetadata,
    generateCliprMusic,
    updateCliprMusic,
    updateCliprTextOverlay,
    updateClipTrimRange,
    generateStitchMusic,
    updateStitchMusic,
    updateStitchTextOverlay,
    removeStitch,
  };
}
