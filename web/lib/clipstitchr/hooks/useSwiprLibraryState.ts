"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createSwiprBackgroundAssetFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprBackgroundAssetFromConvexDocument";
import { createSwiprSwipeFromConvexDocument } from "@/lib/clipstitchr/backend/createSwiprSwipeFromConvexDocument";
import { analyzeSwiprBackground } from "@/lib/clipstitchr/client/analyzeSwiprBackground";
import { downloadSwiprBackgroundBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadSwiprBackgroundBlobFromR2";
import { uploadSwiprBackgroundBlobToR2 } from "@/lib/clipstitchr/client/r2/uploadSwiprBackgroundBlobToR2";
import { getImageDimensions } from "@/lib/clipstitchr/media/getImageDimensions";
import type {
  SaveSwiprBackgroundOptions,
  SaveSwiprSwipeInput,
  SwiprLibraryValue,
} from "@/lib/clipstitchr/types/SwiprLibraryValue";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function useSwiprLibraryState(): SwiprLibraryValue {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const backgroundDocuments = useQuery(
    api.swiprBackgrounds.list,
    isAuthenticated ? {} : "skip",
  );
  const swipeDocuments = useQuery(
    api.swipes.list,
    isAuthenticated ? {} : "skip",
  );
  const saveBackgroundMutation = useMutation(api.swiprBackgrounds.save);
  const saveSwipeMutation = useMutation(api.swipes.save);
  const removeSwipeMutation = useMutation(api.swipes.remove);
  const [backgrounds, setBackgrounds] = useState<
    SwiprLibraryValue["backgrounds"]
  >([]);
  const [isSavingBackground, setIsSavingBackground] = useState(false);
  const [isSavingSwipe, setIsSavingSwipe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const backgroundBlobCacheRef = useRef(new Map<string, Blob>());
  const backgroundDownloadPromisesRef = useRef(new Map<string, Promise<Blob>>());
  const backgroundDownloadQueueRef = useRef(Promise.resolve());
  const swipes = useMemo(
    () => swipeDocuments?.map(createSwiprSwipeFromConvexDocument) ?? [],
    [swipeDocuments],
  );

  const refresh = useCallback(async () => {
    setRefreshNonce((currentNonce) => currentNonce + 1);
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

  const saveBackground = useCallback(
    async ({
      blob,
      generationDetails,
      originalName,
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
          source,
          imageObject,
          mimeType: imageObject.contentType,
          size: imageObject.size,
          width: dimensions.width,
          height: dimensions.height,
          createdAt,
        });

        const savedBackground = {
          id,
          name: analysis.name,
          tags: analysis.tags,
          description: analysis.description,
          details: details || undefined,
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

  const saveSwipe = useCallback(
    async (input: SaveSwiprSwipeInput): Promise<SwiprSwipe> => {
      setIsSavingSwipe(true);
      setError(null);

      try {
        const now = new Date().toISOString();
        const swipe = {
          ...input,
          createdAt: input.createdAt ?? now,
          updatedAt: input.updatedAt ?? now,
        };

        await saveSwipeMutation(swipe);
        await refresh();

        return swipe;
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
    [refresh, saveSwipeMutation],
  );

  const removeSwipe = useCallback(
    async (id: string) => {
      setError(null);

      try {
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
    [refresh, removeSwipeMutation],
  );

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !backgroundDocuments) {
      if (!isAuthLoading && !isAuthenticated) {
        void Promise.resolve().then(() => {
          backgroundBlobCacheRef.current.clear();
          backgroundDownloadPromisesRef.current.clear();
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
    refreshNonce,
  ]);

  return {
    backgrounds,
    swipes,
    isLoading:
      isAuthLoading ||
      (isAuthenticated &&
        (backgroundDocuments === undefined || swipeDocuments === undefined)),
    isSavingBackground,
    isSavingSwipe,
    error,
    refresh,
    loadBackgroundBlob,
    saveBackground,
    saveSwipe,
    removeSwipe,
  };
}
