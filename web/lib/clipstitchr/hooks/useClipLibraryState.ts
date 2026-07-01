"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  useConvex,
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import { usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { createStitchFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchFromConvexDocument";
import { createVideoClipFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipFromConvexDocument";
import { createVideoClipMetadataFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipMetadataFromConvexDocument";
import { getDefinedR2Objects } from "@/lib/clipstitchr/backend/getDefinedR2Objects";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { downloadCachedR2ImageBlobs } from "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { uploadStitchPosterBlob } from "@/lib/clipstitchr/client/r2/uploadStitchPosterBlob";
import { uploadVideoClipPosterBlob } from "@/lib/clipstitchr/client/r2/uploadVideoClipPosterBlob";
import { scoreStitch as requestStitchScore } from "@/lib/clipstitchr/client/scoreStitch";
import { scoreVideoClip as requestVideoClipScore } from "@/lib/clipstitchr/client/scoreVideoClip";
import { saveRenderedStitchVideo } from "@/lib/clipstitchr/client/saveRenderedStitchVideo";
import { libraryMetadataPageSize } from "@/lib/clipstitchr/constants/libraryMetadataPageSize";
import { useActiveLibraryTab } from "@/lib/clipstitchr/hooks/useActiveLibraryTab";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createStitchPosterBlob } from "@/lib/clipstitchr/media/createStitchPosterBlob";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ClipLibraryCounts } from "@/lib/clipstitchr/types/ClipLibraryCounts";
import type { ClipLibrarySortOrder } from "@/lib/clipstitchr/types/ClipLibrarySortOrder";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { ClipLibraryValue } from "@/lib/clipstitchr/types/ClipLibraryValue";
import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createStitchQuickEditUpdate } from "@/lib/clipstitchr/utils/createStitchQuickEditUpdate";
import { getClipLibraryDisplayCounts } from "@/lib/clipstitchr/utils/getClipLibraryDisplayCounts";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getDeletableMusicAudioObject } from "@/lib/clipstitchr/utils/getDeletableMusicAudioObject";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditSuggestedTrimRange } from "@/lib/clipstitchr/utils/getQuickEditSuggestedTrimRange";
import { getQuickEditSuggestionsWithReplacedRemoveRanges } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsWithReplacedRemoveRanges";
import { getQuickEditSuggestionsWithCrop } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsWithCrop";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";
import { mergeVideoClipMetadataById } from "@/lib/clipstitchr/utils/mergeVideoClipMetadataById";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type PendingPosterBlobLoad = {
  object: R2ObjectReference;
  promise: Promise<Blob | null>;
  resolve: (blob: Blob | null) => void;
};

export function useClipLibraryState(productId?: string): ClipLibraryValue {
  const convex = useConvex();
  const pathname = usePathname() ?? "";
  const activeLibraryTab = useActiveLibraryTab();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] =
    useState<ClipLibrarySortOrder>("newest");
  const isDashboardHome = pathname === "/dashboard";
  const isLibraryRoute = pathname.startsWith("/dashboard/library");
  const isOnboardingRoute = pathname.startsWith("/dashboard/onboarding");
  const isUploadsRoute = pathname.startsWith("/dashboard/uploads");
  const isStitchrRoute = pathname.startsWith("/dashboard/stitchr");
  const isSwaprRoute = pathname.startsWith("/dashboard/swapr");
  const isCliprRoute = pathname.startsWith("/dashboard/clipr");
  const shouldLoadAllClips = isAuthenticated && isSwaprRoute;
  const shouldLoadUgcClips =
    isAuthenticated &&
    (isLibraryRoute
      ? activeLibraryTab === "ugc" || activeLibraryTab === "stitches"
      : isOnboardingRoute || isUploadsRoute || isStitchrRoute);
  const shouldLoadCliprClips =
    isAuthenticated &&
    (isLibraryRoute
      ? activeLibraryTab === "stitches"
      : isOnboardingRoute || isUploadsRoute || isStitchrRoute);
  const shouldLoadPostedCliprClips = false;
  const shouldLoadDemoClips =
    isAuthenticated &&
    (isLibraryRoute
      ? activeLibraryTab === "demo" || activeLibraryTab === "stitches"
      : isOnboardingRoute || isUploadsRoute || isStitchrRoute || isCliprRoute);
  const shouldLoadSwapClips =
    isAuthenticated &&
    (isLibraryRoute
      ? activeLibraryTab === "swaps" || activeLibraryTab === "stitches"
      : isUploadsRoute || isStitchrRoute);
  const shouldLoadStitches =
    isAuthenticated &&
    (isLibraryRoute
      ? activeLibraryTab === "stitches"
      : isUploadsRoute || isSwaprRoute);
  const shouldLoadPostedStitches =
    isAuthenticated &&
    (isLibraryRoute ? activeLibraryTab === "stitches" : isUploadsRoute);
  const shouldLoadCounts =
    isAuthenticated && (isDashboardHome || isLibraryRoute || isUploadsRoute);
  const productQueryArgs = productId ? { productId } : {};
  const clipDocumentsQuery = usePaginatedQuery(
    api.videoClips.list,
    shouldLoadAllClips ? { sortOrder, ...productQueryArgs } : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const ugcClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    shouldLoadUgcClips
      ? { kind: "ugc", sortOrder, ...productQueryArgs }
      : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const cliprClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    shouldLoadCliprClips
      ? { kind: "clipr", sortOrder, ...productQueryArgs }
      : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const postedCliprClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    shouldLoadPostedCliprClips
      ? {
          kind: "clipr",
          postedStatus: "posted",
          sortOrder,
          ...productQueryArgs,
        }
      : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const demoClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    shouldLoadDemoClips
      ? { kind: "demo", sortOrder, ...productQueryArgs }
      : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const swapClipDocumentsQuery = usePaginatedQuery(
    api.videoClips.listByLibraryKind,
    shouldLoadSwapClips
      ? { kind: "swapr", sortOrder, ...productQueryArgs }
      : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const stitchDocumentsQuery = usePaginatedQuery(
    api.stitches.list,
    shouldLoadStitches
      ? { postedStatus: "active", sortOrder, ...productQueryArgs }
      : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const postedStitchDocumentsQuery = usePaginatedQuery(
    api.stitches.list,
    shouldLoadPostedStitches
      ? { postedStatus: "posted", sortOrder, ...productQueryArgs }
      : "skip",
    { initialNumItems: libraryMetadataPageSize },
  );
  const aggregateCounts = useQuery(
    api.libraryCounts.get,
    shouldLoadCounts ? productQueryArgs : "skip",
  );
  const clipDocuments = clipDocumentsQuery.results;
  const ugcClipDocuments = ugcClipDocumentsQuery.results;
  const cliprClipDocuments = cliprClipDocumentsQuery.results;
  const postedCliprClipDocuments = postedCliprClipDocumentsQuery.results;
  const demoClipDocuments = demoClipDocumentsQuery.results;
  const swapClipDocuments = swapClipDocumentsQuery.results;
  const stitchDocuments = stitchDocumentsQuery.results;
  const postedStitchDocuments = postedStitchDocumentsQuery.results;
  const allStitchDocuments = useMemo(
    () => [...stitchDocuments, ...postedStitchDocuments],
    [postedStitchDocuments, stitchDocuments],
  );
  const updateClipMetadataMutation = useMutation(api.videoClips.updateMetadata);
  const updateClipCropMutation = useMutation(api.videoClips.updateCrop);
  const updateClipCutsMutation = useMutation(api.videoClips.updateCuts);
  const updateClipPosterMutation = useMutation(api.videoClips.updatePoster);
  const applyClipQuickEditMutation = useMutation(api.videoClips.applyQuickEdit);
  const resetClipQuickEditMutation = useMutation(api.videoClips.resetQuickEdit);
  const updateCliprMusicMutation = useMutation(api.videoClips.updateCliprMusic);
  const updateClipPostedStatusMutation = useMutation(
    api.videoClips.updatePostedStatus,
  );
  const updateStitchMusicMutation = useMutation(api.stitches.updateMusic);
  const applyStitchQuickEditMutation = useMutation(api.stitches.applyQuickEdit);
  const resetStitchQuickEditMutation = useMutation(api.stitches.resetQuickEdit);
  const updateRenderedStitchVideoMutation = useMutation(
    api.stitches.updateRenderedVideo,
  );
  const updateStitchSourceSettingsMutation = useMutation(
    api.stitches.updateSourceSettings,
  );
  const updateStitchSourceCropMutation = useMutation(
    api.stitches.updateSourceCrop,
  );
  const updateStitchSourceCutsMutation = useMutation(
    api.stitches.updateSourceCuts,
  );
  const updateStitchTextOverlayMutation = useMutation(
    api.stitches.updateTextOverlay,
  );
  const updateStitchSocialCaptionMutation = useMutation(
    api.stitches.updateSocialCaption,
  );
  const updateStitchPostedStatusMutation = useMutation(
    api.stitches.updatePostedStatus,
  );
  const removeClipMutation = useMutation(api.videoClips.remove);
  const removeStitchMutation = useMutation(api.stitches.remove);
  const clipCacheRef = useRef(new Map<string, VideoClip>());
  const stitchBlobCacheRef = useRef(new Map<string, Blob>());
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
  const postedCliprClips = useMemo(
    () =>
      postedCliprClipDocuments.map((clip) =>
        createVideoClipMetadataFromConvexDocument(clip),
      ),
    [postedCliprClipDocuments],
  );
  const visibleUgcClips = useMemo(
    () => mergeVideoClipMetadataById([...ugcClips, ...cliprClips]),
    [cliprClips, ugcClips],
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
  const postedStitches = useMemo(
    () =>
      postedStitchDocuments.map((stitch) =>
        createStitchFromConvexDocument({ stitch }),
      ),
    [postedStitchDocuments],
  );
  const loadedCounts = useMemo<ClipLibraryCounts>(
    () => ({
      activeStitches: stitches.length,
      cliprClips: 0,
      demoClips: clips.filter((clip) => clip.clipType === "demo").length,
      postedStitches: postedStitches.length,
      stitches: stitches.length + postedStitches.length,
      swapClips: clips.filter(
        (clip) => clip.swaprMetadata?.source === "swapr",
      ).length,
      ugcClips: clips.filter(
        (clip) =>
          clip.clipType === "ugc" &&
          clip.swaprMetadata?.source !== "swapr",
      ).length,
    }),
    [clips, postedStitches.length, stitches.length],
  );
  const counts = getClipLibraryDisplayCounts(aggregateCounts, loadedCounts);

  const refresh = useCallback(async () => {
    setError(null);
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

  const loadStitch = useCallback(async (id: string) => {
    const stitchDocument =
      allStitchDocuments.find((stitch) => stitch.id === id) ??
      (await convex.query(api.stitches.get, { id }));

    if (!stitchDocument) {
      return null;
    }

    return createStitchFromConvexDocument({ stitch: stitchDocument });
  }, [allStitchDocuments, convex]);

  const loadStitchPoster = useCallback(async (id: string) => {
    const stitchDocument =
      allStitchDocuments.find((stitch) => stitch.id === id) ??
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
  }, [allStitchDocuments, clipDocuments, convex, loadPosterBlob]);

  const loadStitchVideo = useCallback(
    async (stitch: Stitch) => {
      if (stitch.blob) {
        return stitch.blob;
      }

      if (stitch.stitchObject) {
        const cachedBlob = stitchBlobCacheRef.current.get(
          stitch.stitchObject.key,
        );

        if (cachedBlob) {
          return cachedBlob;
        }

        const blob = await downloadBlobFromR2(stitch.stitchObject);

        stitchBlobCacheRef.current.set(stitch.stitchObject.key, blob);
        return blob;
      }

      const renderedVideo = await saveRenderedStitchVideo({
        loadClip,
        stitch,
        updateRenderedVideo: updateRenderedStitchVideoMutation,
      });

      stitchBlobCacheRef.current.set(
        renderedVideo.stitchObject.key,
        renderedVideo.blob,
      );
      await refresh();

      return renderedVideo.blob;
    },
    [loadClip, refresh, updateRenderedStitchVideoMutation],
  );

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

  const updateClipPostedStatus = useCallback(
    async (clip: VideoClipMetadata, isPosted: boolean) => {
      await updateClipPostedStatusMutation({
        id: clip.id,
        isPosted,
      });
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh, updateClipPostedStatusMutation],
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

  const scoreClip = useCallback(
    async (clip: VideoClipMetadata) => {
      const performanceScore = await requestVideoClipScore(clip.id);

      clipCacheRef.current.delete(clip.id);
      await refresh();
      return performanceScore;
    },
    [refresh],
  );

  const updateClipCrop = useCallback(
    async (clip: VideoClipMetadata, crop: QuickEditCrop | null) => {
      const previousPosterObject = clip.posterObject;
      const nextUpdatedAt = new Date().toISOString();
      const loadedClip = await loadClip(clip.id);
      let posterObject: R2ObjectReference | null = null;

      try {
        if (loadedClip) {
          const posterBlob = await createVideoPosterBlob(loadedClip.blob, {
            crop,
          });

          posterObject = await uploadVideoClipPosterBlob({
            blob: posterBlob,
            clipId: clip.id,
          });
          posterBlobCacheRef.current.set(posterObject.key, posterBlob);
        }
      } catch {
        posterObject = null;
      }

      await updateClipCropMutation({
        id: clip.id,
        crop,
        updatedAt: nextUpdatedAt,
      });

      if (posterObject) {
        await updateClipPosterMutation({
          id: clip.id,
          posterObject,
          posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
          updatedAt: nextUpdatedAt,
        });
      }

      if (
        posterObject &&
        previousPosterObject &&
        previousPosterObject.key !== posterObject.key
      ) {
        await deleteObjectsFromR2([previousPosterObject]).catch(() => null);
        posterBlobCacheRef.current.delete(previousPosterObject.key);
      }

      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [loadClip, refresh, updateClipCropMutation, updateClipPosterMutation],
  );

  const updateClipCuts = useCallback(
    async (
      clip: VideoClipMetadata,
      removeRanges: QuickEditRemoveRange[],
    ) => {
      await updateClipCutsMutation({
        id: clip.id,
        removeRanges: normalizeQuickEditRemoveRanges(
          removeRanges,
          clip.duration,
        ),
        updatedAt: new Date().toISOString(),
      });
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh, updateClipCutsMutation],
  );

  const applyClipQuickEdit = useCallback(
    async (clip: VideoClipMetadata) => {
      const quickEdit = clip.performanceScore?.quickEditSuggestions;

      if (!quickEdit) {
        throw new Error("Score this clip first, then try Improve.");
      }

      await applyClipQuickEditMutation({
        id: clip.id,
        defaultTrimRange: getQuickEditSuggestedTrimRange({
          currentTrimRange: getDefaultVideoTrimRange(clip),
          duration: clip.duration,
          suggestions: quickEdit,
        }),
        quickEdit,
        updatedAt: new Date().toISOString(),
      });
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [applyClipQuickEditMutation, refresh],
  );

  const resetClipQuickEdit = useCallback(
    async (clip: VideoClipMetadata) => {
      await resetClipQuickEditMutation({
        id: clip.id,
        updatedAt: new Date().toISOString(),
      });
      clipCacheRef.current.delete(clip.id);
      await refresh();
    },
    [refresh, resetClipQuickEditMutation],
  );

  const updateStitchMusic = useCallback(
    async (stitch: Stitch, music: StitchMusicMetadata | null) => {
      const previousMusicObject = stitch.music?.audioObject;
      const previousStitchObject = stitch.stitchObject;
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

      const objectsToDelete = [
        ...(previousMusicObject &&
        previousMusicObject.key.startsWith("users/") &&
        (!music || previousMusicObject.key !== music.audioObject.key)
          ? [previousMusicObject]
          : []),
        ...(previousStitchObject ? [previousStitchObject] : []),
      ];

      if (objectsToDelete.length) {
        await deleteObjectsFromR2(objectsToDelete).catch(() => null);
      }

      if (previousStitchObject) {
        stitchBlobCacheRef.current.delete(previousStitchObject.key);
      }

      await refresh();
    },
    [refresh, updateStitchMusicMutation],
  );

  const updateStitchSourceSettings = useCallback(
    async (stitch: Stitch, update: StitchSourceSettingsUpdate) => {
      const previousPosterObject = stitch.posterObject;
      const previousStitchObject = stitch.stitchObject;
      let posterObject: R2ObjectReference | null = null;
      const nextTextOverlays = getNonEmptyTextOverlays(
        clampTextOverlays(
          getTextOverlayList(stitch.textOverlays, stitch.textOverlay),
          update.duration,
        ),
      );

      try {
        const [ugcClip, demoClip] = await Promise.all([
          loadClip(update.ugcClipId),
          loadClip(update.demoClipId),
        ]);
        const ugcQuickEdit =
          stitch.ugcClipId === update.ugcClipId ? stitch.ugcQuickEdit : undefined;
        const demoQuickEdit =
          stitch.demoClipId === update.demoClipId
            ? stitch.demoQuickEdit
            : undefined;

        if (ugcClip && demoClip) {
          const posterBlob = await createStitchPosterBlob({
            demoClip,
            demoPlaybackRate: update.demoPlaybackRate,
            demoQuickEdit,
            demoTrimRange: update.demoTrimRange,
            duration: update.duration,
            textOverlay: nextTextOverlays[0] ?? null,
            textOverlays: nextTextOverlays,
            ugcClip,
            ugcPlaybackRate: update.ugcPlaybackRate,
            ugcQuickEdit,
            ugcTrimRange: update.ugcTrimRange,
          });

          posterObject = await uploadStitchPosterBlob({
            blob: posterBlob,
            stitchId: stitch.id,
          });
          posterBlobCacheRef.current.set(posterObject.key, posterBlob);
        }
      } catch {
        posterObject = null;
      }

      await updateStitchSourceSettingsMutation({
        id: stitch.id,
        ...update,
        posterObject,
        posterVersion: posterObject ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
      });

      if (previousPosterObject && previousPosterObject.key !== posterObject?.key) {
        await deleteObjectsFromR2([previousPosterObject]).catch(() => null);
        posterBlobCacheRef.current.delete(previousPosterObject.key);
      }

      if (previousStitchObject) {
        await deleteObjectsFromR2([previousStitchObject]).catch(() => null);
        stitchBlobCacheRef.current.delete(previousStitchObject.key);
      }

      await refresh();
    },
    [loadClip, refresh, updateStitchSourceSettingsMutation],
  );

  const updateStitchSourceCrop = useCallback(
    async (
      stitch: Stitch,
      source: "ugc" | "demo",
      crop: QuickEditCrop | null,
    ) => {
      const previousPosterObject = stitch.posterObject;
      const previousStitchObject = stitch.stitchObject;
      const [ugcClip, demoClip] = await Promise.all([
        loadClip(stitch.ugcClipId),
        loadClip(stitch.demoClipId),
      ]);

      if (!ugcClip || !demoClip) {
        throw new Error("Unable to load the source videos for this stitch.");
      }

      const ugcQuickEdit =
        source === "ugc"
          ? getQuickEditSuggestionsWithCrop(stitch.ugcQuickEdit, crop)
          : stitch.ugcQuickEdit;
      const demoQuickEdit =
        source === "demo"
          ? getQuickEditSuggestionsWithCrop(stitch.demoQuickEdit, crop)
          : stitch.demoQuickEdit;
      let posterObject: R2ObjectReference | null = null;

      try {
        const posterBlob = await createStitchPosterBlob({
          demoClip,
          demoPlaybackRate: stitch.demoPlaybackRate ?? 1,
          demoQuickEdit,
          demoTrimRange:
            stitch.demoTrimRange ?? getDefaultVideoTrimRange(demoClip),
          duration: stitch.duration,
          textOverlay: stitch.textOverlay ?? null,
          textOverlays: stitch.textOverlays,
          ugcClip,
          ugcPlaybackRate: stitch.ugcPlaybackRate ?? 1,
          ugcQuickEdit,
          ugcTrimRange: stitch.ugcTrimRange ?? getDefaultVideoTrimRange(ugcClip),
        });

        posterObject = await uploadStitchPosterBlob({
          blob: posterBlob,
          stitchId: stitch.id,
        });
        posterBlobCacheRef.current.set(posterObject.key, posterBlob);
      } catch {
        posterObject = null;
      }

      await updateStitchSourceCropMutation({
        id: stitch.id,
        crop,
        posterObject,
        posterVersion: posterObject ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
        source,
      });

      if (previousPosterObject && previousPosterObject.key !== posterObject?.key) {
        await deleteObjectsFromR2([previousPosterObject]).catch(() => null);
        posterBlobCacheRef.current.delete(previousPosterObject.key);
      }

      if (previousStitchObject) {
        await deleteObjectsFromR2([previousStitchObject]).catch(() => null);
        stitchBlobCacheRef.current.delete(previousStitchObject.key);
      }

      await refresh();
    },
    [loadClip, refresh, updateStitchSourceCropMutation],
  );

  const updateStitchSourceCuts = useCallback(
    async (
      stitch: Stitch,
      source: "ugc" | "demo",
      removeRanges: QuickEditRemoveRange[],
    ) => {
      const previousPosterObject = stitch.posterObject;
      const previousStitchObject = stitch.stitchObject;
      const [ugcClip, demoClip] = await Promise.all([
        loadClip(stitch.ugcClipId),
        loadClip(stitch.demoClipId),
      ]);

      if (!ugcClip || !demoClip) {
        throw new Error("Unable to load the source videos for this stitch.");
      }

      const normalizedRemoveRanges = normalizeQuickEditRemoveRanges(
        removeRanges,
        source === "ugc" ? ugcClip.duration : demoClip.duration,
      );
      const ugcQuickEdit =
        source === "ugc"
          ? getQuickEditSuggestionsWithReplacedRemoveRanges({
              duration: ugcClip.duration,
              quickEdit: stitch.ugcQuickEdit,
              removeRanges: normalizedRemoveRanges,
            })
          : stitch.ugcQuickEdit;
      const demoQuickEdit =
        source === "demo"
          ? getQuickEditSuggestionsWithReplacedRemoveRanges({
              duration: demoClip.duration,
              quickEdit: stitch.demoQuickEdit,
              removeRanges: normalizedRemoveRanges,
            })
          : stitch.demoQuickEdit;
      const ugcTrimRange =
        stitch.ugcTrimRange ?? getDefaultVideoTrimRange(ugcClip);
      const demoTrimRange =
        stitch.demoTrimRange ?? getDefaultVideoTrimRange(demoClip);
      const duration =
        getQuickEditPlaybackDuration(
          ugcTrimRange,
          ugcClip.duration,
          ugcQuickEdit?.removeRanges,
          stitch.ugcPlaybackRate ?? 1,
        ) +
        getQuickEditPlaybackDuration(
          demoTrimRange,
          demoClip.duration,
          demoQuickEdit?.removeRanges,
          stitch.demoPlaybackRate ?? 1,
        );
      let posterObject: R2ObjectReference | null = null;

      try {
        const posterBlob = await createStitchPosterBlob({
          demoClip,
          demoPlaybackRate: stitch.demoPlaybackRate ?? 1,
          demoQuickEdit,
          demoTrimRange,
          duration,
          textOverlay: stitch.textOverlay ?? null,
          textOverlays: stitch.textOverlays,
          ugcClip,
          ugcPlaybackRate: stitch.ugcPlaybackRate ?? 1,
          ugcQuickEdit,
          ugcTrimRange,
        });

        posterObject = await uploadStitchPosterBlob({
          blob: posterBlob,
          stitchId: stitch.id,
        });
        posterBlobCacheRef.current.set(posterObject.key, posterBlob);
      } catch {
        posterObject = null;
      }

      await updateStitchSourceCutsMutation({
        id: stitch.id,
        duration,
        posterObject,
        posterVersion: posterObject ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
        removeRanges: normalizedRemoveRanges,
        source,
      });

      if (previousPosterObject && previousPosterObject.key !== posterObject?.key) {
        await deleteObjectsFromR2([previousPosterObject]).catch(() => null);
        posterBlobCacheRef.current.delete(previousPosterObject.key);
      }

      if (previousStitchObject) {
        await deleteObjectsFromR2([previousStitchObject]).catch(() => null);
        stitchBlobCacheRef.current.delete(previousStitchObject.key);
      }

      await refresh();
    },
    [loadClip, refresh, updateStitchSourceCutsMutation],
  );

  const updateStitchTextOverlay = useCallback(
    async (
      stitch: Stitch,
      textOverlay: TextOverlay | TextOverlay[] | null,
    ) => {
      const previousPosterObject = stitch.posterObject;
      const nextTextOverlays = getNonEmptyTextOverlays(
        clampTextOverlays(
          Array.isArray(textOverlay)
            ? textOverlay
            : getTextOverlayList(undefined, textOverlay),
          stitch.duration,
        ),
      );
      const firstTextOverlay = nextTextOverlays[0] ?? null;
      let posterObject: R2ObjectReference | null = null;

      if (stitch.mode !== "longr") {
        try {
          const [ugcClip, demoClip] = await Promise.all([
            loadClip(stitch.ugcClipId),
            loadClip(stitch.demoClipId),
          ]);

          if (ugcClip && demoClip) {
            const posterBlob = await createStitchPosterBlob({
              demoClip,
              demoPlaybackRate: stitch.demoPlaybackRate ?? 1,
              demoQuickEdit: stitch.demoQuickEdit,
              demoTrimRange:
                stitch.demoTrimRange ?? getDefaultVideoTrimRange(demoClip),
              duration: stitch.duration,
              textOverlay: firstTextOverlay,
              textOverlays: nextTextOverlays,
              ugcClip,
              ugcPlaybackRate: stitch.ugcPlaybackRate ?? 1,
              ugcQuickEdit: stitch.ugcQuickEdit,
              ugcTrimRange:
                stitch.ugcTrimRange ?? getDefaultVideoTrimRange(ugcClip),
            });

            posterObject = await uploadStitchPosterBlob({
              blob: posterBlob,
              stitchId: stitch.id,
            });
            posterBlobCacheRef.current.set(posterObject.key, posterBlob);
          }
        } catch {
          posterObject = null;
        }
      }

      await updateStitchTextOverlayMutation({
        id: stitch.id,
        posterObject,
        posterVersion: posterObject ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
        textOverlay: firstTextOverlay,
        textOverlays: nextTextOverlays,
      });

      if (previousPosterObject && previousPosterObject.key !== posterObject?.key) {
        await deleteObjectsFromR2([previousPosterObject]).catch(() => null);
        posterBlobCacheRef.current.delete(previousPosterObject.key);
      }

      if (stitch.stitchObject) {
        await deleteObjectsFromR2([stitch.stitchObject]).catch(() => null);
        stitchBlobCacheRef.current.delete(stitch.stitchObject.key);
      }

      await refresh();
    },
    [loadClip, refresh, updateStitchTextOverlayMutation],
  );

  const updateStitchSocialCaption = useCallback(
    async (stitch: Stitch, socialCaption: string | null) => {
      await updateStitchSocialCaptionMutation({
        id: stitch.id,
        socialCaption,
      });

      await refresh();
    },
    [refresh, updateStitchSocialCaptionMutation],
  );

  const updateStitchPostedStatus = useCallback(
    async (stitch: Stitch, isPosted: boolean) => {
      await updateStitchPostedStatusMutation({
        id: stitch.id,
        isPosted,
      });
      await refresh();
    },
    [refresh, updateStitchPostedStatusMutation],
  );

  const scoreStitch = useCallback(
    async (stitch: Stitch) => {
      await loadStitchVideo(stitch);

      const stitchScore = await requestStitchScore(stitch.id);

      await refresh();
      return stitchScore;
    },
    [loadStitchVideo, refresh],
  );

  const applyStitchQuickEdit = useCallback(
    async (stitch: Stitch) => {
      const quickEdit = stitch.stitchScore?.quickEditSuggestions;

      if (!quickEdit) {
        throw new Error("Score this stitch first, then try Improve.");
      }

      const [ugcClip, demoClip] = await Promise.all([
        loadClip(stitch.ugcClipId),
        loadClip(stitch.demoClipId),
      ]);

      if (!ugcClip || !demoClip) {
        throw new Error("Unable to load the source videos for this stitch.");
      }

      const previousStitchObject = stitch.stitchObject;
      const previousPosterObject = stitch.posterObject;
      const update = createStitchQuickEditUpdate({
        demoClip,
        quickEdit,
        stitch,
        ugcClip,
      });
      let posterObject: R2ObjectReference | null = null;

      try {
        const posterBlob = await createStitchPosterBlob({
          demoClip,
          demoPlaybackRate: stitch.demoPlaybackRate ?? 1,
          demoQuickEdit: update.demoQuickEdit,
          demoTrimRange: update.demoTrimRange,
          duration: update.duration,
          textOverlay: update.textOverlay,
          textOverlays: update.textOverlays,
          ugcClip,
          ugcPlaybackRate: stitch.ugcPlaybackRate ?? 1,
          ugcQuickEdit: update.ugcQuickEdit,
          ugcTrimRange: update.ugcTrimRange,
        });

        posterObject = await uploadStitchPosterBlob({
          blob: posterBlob,
          stitchId: stitch.id,
        });
        posterBlobCacheRef.current.set(posterObject.key, posterBlob);
      } catch {
        posterObject = null;
      }

      await applyStitchQuickEditMutation({
        id: stitch.id,
        ...update,
        posterObject,
        posterVersion: posterObject ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
      });

      if (previousPosterObject && previousPosterObject.key !== posterObject?.key) {
        await deleteObjectsFromR2([previousPosterObject]).catch(() => null);
        posterBlobCacheRef.current.delete(previousPosterObject.key);
      }

      if (previousStitchObject) {
        await deleteObjectsFromR2([previousStitchObject]).catch(() => null);
        stitchBlobCacheRef.current.delete(previousStitchObject.key);
      }

      await refresh();
    },
    [applyStitchQuickEditMutation, loadClip, refresh],
  );

  const resetStitchQuickEdit = useCallback(
    async (stitch: Stitch) => {
      const previousPosterObject = stitch.posterObject;
      const previousStitchObject = stitch.stitchObject;
      const baseline = stitch.quickEdit?.baseline;
      let posterObject: R2ObjectReference | null = null;

      try {
        const [ugcClip, demoClip] = await Promise.all([
          loadClip(stitch.ugcClipId),
          loadClip(stitch.demoClipId),
        ]);

        if (ugcClip && demoClip) {
          const posterBlob = await createStitchPosterBlob({
            demoClip,
            demoPlaybackRate: stitch.demoPlaybackRate ?? 1,
            demoQuickEdit: baseline?.demoQuickEdit,
            demoTrimRange:
              baseline?.demoTrimRange ??
              stitch.demoTrimRange ??
              getDefaultVideoTrimRange(demoClip),
            duration: baseline?.duration ?? stitch.duration,
            textOverlay: baseline?.textOverlay ?? null,
            textOverlays: baseline?.textOverlays,
            ugcClip,
            ugcPlaybackRate: stitch.ugcPlaybackRate ?? 1,
            ugcQuickEdit: baseline?.ugcQuickEdit,
            ugcTrimRange:
              baseline?.ugcTrimRange ??
              stitch.ugcTrimRange ??
              getDefaultVideoTrimRange(ugcClip),
          });

          posterObject = await uploadStitchPosterBlob({
            blob: posterBlob,
            stitchId: stitch.id,
          });
          posterBlobCacheRef.current.set(posterObject.key, posterBlob);
        }
      } catch {
        posterObject = null;
      }

      await resetStitchQuickEditMutation({
        id: stitch.id,
        posterObject,
        posterVersion: posterObject ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
      });

      if (previousPosterObject && previousPosterObject.key !== posterObject?.key) {
        await deleteObjectsFromR2([previousPosterObject]).catch(() => null);
        posterBlobCacheRef.current.delete(previousPosterObject.key);
      }

      if (previousStitchObject) {
        await deleteObjectsFromR2([previousStitchObject]).catch(() => null);
        stitchBlobCacheRef.current.delete(previousStitchObject.key);
      }

      await refresh();
    },
    [loadClip, refresh, resetStitchQuickEditMutation],
  );

  const removeStitch = useCallback(
    async (id: string) => {
      const stitchDocument =
        allStitchDocuments.find((stitch) => stitch.id === id) ??
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
    [allStitchDocuments, convex, refresh, removeStitchMutation],
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

    if (cliprClipDocumentsQuery.status === "CanLoadMore") {
      cliprClipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [cliprClipDocumentsQuery, ugcClipDocumentsQuery]);
  const loadMoreCliprClips = useCallback(() => {
    if (cliprClipDocumentsQuery.status === "CanLoadMore") {
      cliprClipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [cliprClipDocumentsQuery]);
  const loadMorePostedCliprClips = useCallback(() => {
    if (postedCliprClipDocumentsQuery.status === "CanLoadMore") {
      postedCliprClipDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [postedCliprClipDocumentsQuery]);
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
  const loadMorePostedStitches = useCallback(() => {
    if (postedStitchDocumentsQuery.status === "CanLoadMore") {
      postedStitchDocumentsQuery.loadMore(libraryMetadataPageSize);
    }
  }, [postedStitchDocumentsQuery]);
  const isLoadingFirstPage =
    isAuthenticated &&
    ((shouldLoadAllClips &&
      clipDocumentsQuery.status === "LoadingFirstPage") ||
      (shouldLoadUgcClips &&
        ugcClipDocumentsQuery.status === "LoadingFirstPage") ||
      (shouldLoadCliprClips &&
        cliprClipDocumentsQuery.status === "LoadingFirstPage") ||
      (shouldLoadPostedCliprClips &&
        postedCliprClipDocumentsQuery.status === "LoadingFirstPage") ||
      (shouldLoadDemoClips &&
        demoClipDocumentsQuery.status === "LoadingFirstPage") ||
      (shouldLoadSwapClips &&
        swapClipDocumentsQuery.status === "LoadingFirstPage") ||
      (shouldLoadStitches &&
        stitchDocumentsQuery.status === "LoadingFirstPage") ||
      (shouldLoadPostedStitches &&
        postedStitchDocumentsQuery.status === "LoadingFirstPage"));

  return {
    clips,
    counts,
    postedStitches,
    stitches,
    sortOrder,
    videoGroups: {
      clipr: {
        clips: cliprClips,
        postedClips: postedCliprClips,
        hasMoreItems: cliprClipDocumentsQuery.status === "CanLoadMore",
        hasMorePostedItems:
          postedCliprClipDocumentsQuery.status === "CanLoadMore",
        isLoadingMoreItems: cliprClipDocumentsQuery.status === "LoadingMore",
        isLoadingMorePostedItems:
          postedCliprClipDocumentsQuery.status === "LoadingMore",
        loadMoreItems: loadMoreCliprClips,
        loadMorePostedItems: loadMorePostedCliprClips,
      },
      demo: {
        clips: demoClips,
        postedClips: [],
        hasMoreItems: demoClipDocumentsQuery.status === "CanLoadMore",
        hasMorePostedItems: false,
        isLoadingMoreItems: demoClipDocumentsQuery.status === "LoadingMore",
        isLoadingMorePostedItems: false,
        loadMoreItems: loadMoreDemoClips,
        loadMorePostedItems: () => undefined,
      },
      swapr: {
        clips: swapClips,
        postedClips: [],
        hasMoreItems: swapClipDocumentsQuery.status === "CanLoadMore",
        hasMorePostedItems: false,
        isLoadingMoreItems: swapClipDocumentsQuery.status === "LoadingMore",
        isLoadingMorePostedItems: false,
        loadMoreItems: loadMoreSwapClips,
        loadMorePostedItems: () => undefined,
      },
      ugc: {
        clips: visibleUgcClips,
        postedClips: [],
        hasMoreItems:
          ugcClipDocumentsQuery.status === "CanLoadMore" ||
          cliprClipDocumentsQuery.status === "CanLoadMore",
        hasMorePostedItems: false,
        isLoadingMoreItems:
          ugcClipDocumentsQuery.status === "LoadingMore" ||
          cliprClipDocumentsQuery.status === "LoadingMore",
        isLoadingMorePostedItems: false,
        loadMoreItems: loadMoreUgcClips,
        loadMorePostedItems: () => undefined,
      },
    },
    isLoading: isAuthLoading || isLoadingFirstPage,
    hasMoreClips: clipDocumentsQuery.status === "CanLoadMore",
    hasMorePostedStitches: postedStitchDocumentsQuery.status === "CanLoadMore",
    hasMoreStitches: stitchDocumentsQuery.status === "CanLoadMore",
    isLoadingMoreClips: clipDocumentsQuery.status === "LoadingMore",
    isLoadingMorePostedStitches:
      postedStitchDocumentsQuery.status === "LoadingMore",
    isLoadingMoreStitches: stitchDocumentsQuery.status === "LoadingMore",
    error,
    refresh,
    setSortOrder,
    loadClip,
    loadClipPoster,
    loadStitch,
    loadStitchVideo,
    loadMoreClips,
    loadMorePostedStitches,
    loadMoreStitches,
    loadStitchPoster,
    removeClip,
    renameClip,
    updateClipCrop,
    updateClipCuts,
    updateClipMetadata,
    scoreClip,
    applyClipQuickEdit,
    resetClipQuickEdit,
    updateCliprMusic,
    updateClipTrimRange,
    updateClipPostedStatus,
    scoreStitch,
    applyStitchQuickEdit,
    resetStitchQuickEdit,
    updateStitchMusic,
    updateStitchSourceCrop,
    updateStitchSourceCuts,
    updateStitchSourceSettings,
    updateStitchTextOverlay,
    updateStitchSocialCaption,
    updateStitchPostedStatus,
    removeStitch,
  };
}
