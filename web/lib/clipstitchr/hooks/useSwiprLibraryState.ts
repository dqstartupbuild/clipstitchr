"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { createSwiprBackgroundAssetFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprBackgroundAssetFromConvexDocument";
import { createSwiprSwipeFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprSwipeFromConvexDocument";
import { analyzeSwiprBackground } from "@/lib/clipstitchr/client/analyzeSwiprBackground";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { downloadCachedR2ImageBlobs } from "@/lib/clipstitchr/client/r2/downloadCachedR2ImageBlobs";
import { downloadSwiprBackgroundBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadSwiprBackgroundBlobFromR2";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { SWIPR_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/swiprPosterCaptureVersion";
import { uploadSwiprBackgroundBlobToR2 } from "@/lib/clipstitchr/client/r2/uploadSwiprBackgroundBlobToR2";
import { getImageDimensions } from "@/lib/clipstitchr/media/getImageDimensions";
import { renderSwiprSlideBlob } from "@/lib/clipstitchr/media/renderSwiprSlideBlob";
import type {
  SaveSwiprBackgroundOptions,
  SaveSwiprSwipeInput,
  SwiprLibraryValue,
} from "@/lib/clipstitchr/types/SwiprLibraryValue";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getSwiprLibraryBackgroundsByPackName } from "@/lib/clipstitchr/utils/getSwiprLibraryBackgroundsByPackName";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";

export function useSwiprLibraryState(productId?: string): SwiprLibraryValue {
  const pathname = usePathname() ?? "";
  const convex = useConvex();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const isDashboardHome = pathname === "/dashboard";
  const isLibraryRoute = pathname.startsWith("/dashboard/library");
  const isSettingsRoute = pathname.startsWith("/dashboard/settings");
  const isSwiprRoute = pathname.startsWith("/dashboard/swipr");
  const isUploadsRoute = pathname.startsWith("/dashboard/uploads");
  const shouldLoadBackgrounds =
    isAuthenticated &&
    (isDashboardHome ||
      isLibraryRoute ||
      isSettingsRoute ||
      isSwiprRoute ||
      isUploadsRoute);
  const shouldLoadSwipes =
    isAuthenticated &&
    (isDashboardHome || isLibraryRoute || isSwiprRoute || isUploadsRoute);
  const shouldLoadPostedSwipes =
    isAuthenticated && (isLibraryRoute || isUploadsRoute);
  const productQueryArgs = productId ? { productId } : {};
  const backgroundDocuments = useQuery(
    api.swiprBackgrounds.list,
    shouldLoadBackgrounds ? {} : "skip",
  );
  const swipeDocuments = useQuery(
    api.swipes.list,
    shouldLoadSwipes
      ? { postedStatus: isSwiprRoute ? "all" : "active", ...productQueryArgs }
      : "skip",
  );
  const postedSwipeDocuments = useQuery(
    api.swipes.list,
    shouldLoadPostedSwipes
      ? { postedStatus: "posted", ...productQueryArgs }
      : "skip",
  );
  const saveBackgroundMutation = useMutation(api.swiprBackgrounds.save);
  const removeBackgroundFromLibraryPackMutation = useMutation(
    api.swiprBackgrounds.removeFromLibraryPack,
  );
  const removeLibraryPackMutation = useMutation(
    api.swiprBackgrounds.removeLibraryPack,
  );
  const renameLibraryPackMutation = useMutation(
    api.swiprBackgrounds.renameLibraryPack,
  );
  const saveSwipeMutation = useMutation(api.swipes.save);
  const updateSwipePostedStatusMutation = useMutation(
    api.swipes.updatePostedStatus,
  );
  const removeSwipeMutation = useMutation(api.swipes.remove);
  const [backgrounds, setBackgrounds] = useState<
    SwiprLibraryValue["backgrounds"]
  >([]);
  const [isSavingBackground, setIsSavingBackground] = useState(false);
  const [isSavingSwipe, setIsSavingSwipe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backgroundBlobCacheRef = useRef(new Map<string, Blob>());
  const backgroundDownloadPromisesRef = useRef(new Map<string, Promise<Blob>>());
  const backgroundDownloadQueueRef = useRef(Promise.resolve());
  const swipePosterBlobCacheRef = useRef(new Map<string, Blob>());
  const swipes = useMemo(
    () =>
      swipeDocuments?.map((swipe) =>
        createSwiprSwipeFromConvexDocument(swipe),
      ) ?? [],
    [swipeDocuments],
  );
  const postedSwipes = useMemo(
    () =>
      postedSwipeDocuments?.map((swipe) =>
        createSwiprSwipeFromConvexDocument(swipe),
      ) ?? [],
    [postedSwipeDocuments],
  );
  const allSwipeDocuments = useMemo(
    () => [...(swipeDocuments ?? []), ...(postedSwipeDocuments ?? [])],
    [postedSwipeDocuments, swipeDocuments],
  );

  const refresh = useCallback(async () => {
    setError(null);
  }, []);

  const loadBackgroundBlob = useCallback(async (id: string) => {
    const cachedBlob = backgroundBlobCacheRef.current.get(id);

    if (cachedBlob) {
      return cachedBlob;
    }

    const pendingDownload = backgroundDownloadPromisesRef.current.get(id);

    if (pendingDownload) {
      return pendingDownload;
    }

    const download = backgroundDownloadQueueRef.current.then(
      () => downloadSwiprBackgroundBlobFromR2(id),
      () => downloadSwiprBackgroundBlobFromR2(id),
    );

    backgroundDownloadQueueRef.current = download.then(
      () => undefined,
      () => undefined,
    );
    backgroundDownloadPromisesRef.current.set(id, download);

    try {
      const blob = await download;

      backgroundBlobCacheRef.current.set(id, blob);
      setBackgrounds((currentBackgrounds) =>
        currentBackgrounds.map((background) =>
          background.id === id ? { ...background, blob } : background,
        ),
      );

      return blob;
    } finally {
      backgroundDownloadPromisesRef.current.delete(id);
    }
  }, []);

  const loadBackgroundAsset = useCallback(
    async (id: string) => {
      const backgroundDocument =
        backgroundDocuments?.find((background) => background.id === id) ??
        (await convex.query(api.swiprBackgrounds.get, { id }));

      if (!backgroundDocument) {
        return null;
      }

      const blob =
        backgroundBlobCacheRef.current.get(id) ?? (await loadBackgroundBlob(id));
      const backgroundAsset = createSwiprBackgroundAssetFromConvexDocument(
        backgroundDocument,
        blob,
      );
      const loadedBackgroundAsset = {
        ...backgroundAsset,
        blob,
      };

      setBackgrounds((currentBackgrounds) =>
        currentBackgrounds.some((background) => background.id === id)
          ? currentBackgrounds.map((background) =>
              background.id === id ? loadedBackgroundAsset : background,
            )
          : [loadedBackgroundAsset, ...currentBackgrounds],
      );

      return loadedBackgroundAsset;
    },
    [backgroundDocuments, convex, loadBackgroundBlob],
  );

  const loadSwipePosterBlob = useCallback(
    async (posterObject?: R2ObjectReference) => {
      if (!posterObject) {
        return null;
      }

      const cachedPosterBlob = swipePosterBlobCacheRef.current.get(
        posterObject.key,
      );

      if (cachedPosterBlob) {
        return cachedPosterBlob;
      }

      const posterBlobsByKey = await downloadCachedR2ImageBlobs([posterObject]);
      const posterBlob = posterBlobsByKey.get(posterObject.key) ?? null;

      if (posterBlob) {
        swipePosterBlobCacheRef.current.set(posterObject.key, posterBlob);
      }

      return posterBlob;
    },
    [],
  );

  const loadSwipePoster = useCallback(
    async (id: string) => {
      const swipeDocument = allSwipeDocuments.find((swipe) => swipe.id === id);

      return await loadSwipePosterBlob(swipeDocument?.posterObject);
    },
    [allSwipeDocuments, loadSwipePosterBlob],
  );

  const saveBackground = useCallback(
    async ({
      blob,
      generationDetails,
      libraryQuery,
      originalName,
      pexelsPhotoId,
      source,
    }: SaveSwiprBackgroundOptions) => {
      setIsSavingBackground(true);
      setError(null);

      try {
        const id = createId();
        const [analysis, dimensions] = await Promise.all([
          analyzeSwiprBackground({
            blob,
            originalName,
          }),
          getImageDimensions(blob),
        ]);
        const imageObject = await uploadSwiprBackgroundBlobToR2({
          blob,
          recordId: id,
        });
        const createdAt = new Date().toISOString();
        const details = [
          analysis.details,
          generationDetails
            ? `Generation metadata: ${generationDetails}`
            : undefined,
        ]
          .filter(Boolean)
          .join("\n\n");

        await saveBackgroundMutation({
          id,
          name: analysis.name,
          tags: analysis.tags,
          description: analysis.description,
          details: details || undefined,
          libraryQuery,
          source,
          imageObject,
          mimeType: imageObject.contentType,
          size: imageObject.size,
          width: dimensions.width,
          height: dimensions.height,
          pexelsPhotoId,
          createdAt,
        });

        const savedBackground = {
          id,
          name: analysis.name,
          tags: analysis.tags,
          description: analysis.description,
          details: details || undefined,
          libraryQuery,
          pexelsPhotoId,
          source,
          imageObject,
          blob,
          mimeType: imageObject.contentType,
          size: imageObject.size,
          width: dimensions.width,
          height: dimensions.height,
          createdAt,
        };

        backgroundBlobCacheRef.current.set(id, blob);
        setBackgrounds((currentBackgrounds) => [
          savedBackground,
          ...currentBackgrounds,
        ]);
        await refresh();

        return savedBackground;
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to save this Swipr background.",
        );
        throw nextError;
      } finally {
        setIsSavingBackground(false);
      }
    },
    [refresh, saveBackgroundMutation],
  );

  const removeBackgroundFromLibraryPack = useCallback(
    async (id: string) => {
      setError(null);

      try {
        await removeBackgroundFromLibraryPackMutation({ id });
        setBackgrounds((currentBackgrounds) =>
          currentBackgrounds.map((background) =>
            background.id === id
              ? { ...background, libraryQuery: undefined }
              : background,
          ),
        );
        await refresh();
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to remove this photo from the pack.",
        );
        throw nextError;
      }
    },
    [refresh, removeBackgroundFromLibraryPackMutation],
  );

  const renameLibraryPack = useCallback(
    async (fromLibraryQuery: string, toLibraryQuery: string) => {
      setError(null);

      try {
        const result = await renameLibraryPackMutation({
          fromLibraryQuery,
          toLibraryQuery,
        });
        const fromLibraryQueryKey =
          normalizeSwiprLibraryQueryKey(fromLibraryQuery);

        setBackgrounds((currentBackgrounds) =>
          currentBackgrounds.map((background) =>
            background.source === "pexels" &&
            normalizeSwiprLibraryQueryKey(background.libraryQuery) ===
              fromLibraryQueryKey
              ? { ...background, libraryQuery: result.libraryQuery }
              : background,
          ),
        );
        await refresh();

        return result;
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to rename this pack.",
        );
        throw nextError;
      }
    },
    [refresh, renameLibraryPackMutation],
  );

  const removeLibraryPack = useCallback(
    async (libraryQuery: string) => {
      setError(null);

      try {
        const packBackgrounds = getSwiprLibraryBackgroundsByPackName(
          backgrounds,
          libraryQuery,
        );

        if (packBackgrounds.length) {
          await deleteObjectsFromR2(
            packBackgrounds.map((background) => background.imageObject),
          );
        }

        const result = await removeLibraryPackMutation({ libraryQuery });
        const removedIds = new Set(
          packBackgrounds.map((background) => background.id),
        );

        for (const background of packBackgrounds) {
          backgroundBlobCacheRef.current.delete(background.id);
          backgroundDownloadPromisesRef.current.delete(background.id);
        }

        setBackgrounds((currentBackgrounds) =>
          currentBackgrounds.filter(
            (background) => !removedIds.has(background.id),
          ),
        );
        await refresh();

        return result.count;
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to delete this pack.",
        );
        throw nextError;
      }
    },
    [backgrounds, refresh, removeLibraryPackMutation],
  );

  const saveSwipe = useCallback(
    async (input: SaveSwiprSwipeInput): Promise<SwiprSwipe> => {
      setIsSavingSwipe(true);
      setError(null);

      try {
        const now = new Date().toISOString();
        const firstSlide = input.slides[0];
        let posterBlob: Blob | undefined;
        let posterObject: R2ObjectReference | undefined;

        if (firstSlide) {
          const backgroundBlob = await loadBackgroundBlob(
            firstSlide.backgroundId ?? input.backgroundId,
          );

          posterBlob = await renderSwiprSlideBlob(backgroundBlob, firstSlide);
          [posterObject] = await uploadBlobsToR2([
            {
              blob: posterBlob,
              kind: "swipe-poster",
              recordId: input.id,
            },
          ]);

          if (posterObject) {
            swipePosterBlobCacheRef.current.set(posterObject.key, posterBlob);
          }
        }

        const swipe = {
          ...input,
          ...(posterObject
            ? {
                posterObject,
                posterVersion: SWIPR_POSTER_CAPTURE_VERSION,
              }
            : {}),
          createdAt: input.createdAt ?? now,
          updatedAt: input.updatedAt ?? now,
        };

        await saveSwipeMutation(swipe);
        await refresh();

        return {
          ...swipe,
          posterBlob,
        };
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to save this Swipe.",
        );
        throw nextError;
      } finally {
        setIsSavingSwipe(false);
      }
    },
    [loadBackgroundBlob, refresh, saveSwipeMutation],
  );

  const removeSwipe = useCallback(
    async (id: string) => {
      setError(null);

      try {
        const swipeDocument = allSwipeDocuments.find((swipe) => swipe.id === id);

        if (swipeDocument?.posterObject) {
          await deleteObjectsFromR2([swipeDocument.posterObject]);
          swipePosterBlobCacheRef.current.delete(swipeDocument.posterObject.key);
        }

        await removeSwipeMutation({ id });
        await refresh();
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to delete this Swipe.",
        );
        throw nextError;
      }
    },
    [allSwipeDocuments, refresh, removeSwipeMutation],
  );

  const updateSwipePostedStatus = useCallback(
    async (swipe: SwiprSwipe, isPosted: boolean) => {
      setError(null);

      try {
        await updateSwipePostedStatusMutation({
          id: swipe.id,
          isPosted,
        });
        await refresh();
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to update Swipe posted status.",
        );
        throw nextError;
      }
    },
    [refresh, updateSwipePostedStatusMutation],
  );

  useEffect(() => {
    if (!shouldLoadBackgrounds) {
      void Promise.resolve().then(() => {
        backgroundBlobCacheRef.current.clear();
        backgroundDownloadPromisesRef.current.clear();
        swipePosterBlobCacheRef.current.clear();
        setBackgrounds([]);
      });
      return;
    }

    if (isAuthLoading || !isAuthenticated || !backgroundDocuments) {
      if (!isAuthLoading && !isAuthenticated) {
        void Promise.resolve().then(() => {
          backgroundBlobCacheRef.current.clear();
          backgroundDownloadPromisesRef.current.clear();
          swipePosterBlobCacheRef.current.clear();
          setBackgrounds([]);
        });
      }

      return;
    }

    let isCancelled = false;

    void Promise.resolve().then(() => {
      if (isCancelled) {
        return;
      }

      setError(null);
      setBackgrounds(
        backgroundDocuments.map((background) =>
          createSwiprBackgroundAssetFromConvexDocument(
            background,
            backgroundBlobCacheRef.current.get(background.id),
          ),
        ),
      );
    });

    return () => {
      isCancelled = true;
    };
  }, [
    backgroundDocuments,
    isAuthenticated,
    isAuthLoading,
    shouldLoadBackgrounds,
  ]);

  return {
    backgrounds,
    postedSwipes,
    swipes,
    isLoading:
      isAuthLoading ||
      (shouldLoadBackgrounds && backgroundDocuments === undefined) ||
      (shouldLoadSwipes && swipeDocuments === undefined) ||
      (shouldLoadPostedSwipes && postedSwipeDocuments === undefined),
    isSavingBackground,
    isSavingSwipe,
    error,
    refresh,
    loadBackgroundBlob,
    loadBackgroundAsset,
    loadSwipePoster,
    removeBackgroundFromLibraryPack,
    removeLibraryPack,
    renameLibraryPack,
    saveBackground,
    saveSwipe,
    updateSwipePostedStatus,
    removeSwipe,
  };
}
