"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStitchFromConvexDocument } from "@/lib/clipstitchr/backend/createStitchFromConvexDocument";
import { createVideoClipFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipFromConvexDocument";
import { createVideoClipMetadataFromConvexDocument } from "@/lib/clipstitchr/backend/createVideoClipMetadataFromConvexDocument";
import { getDefinedR2Objects } from "@/lib/clipstitchr/backend/getDefinedR2Objects";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { generateCliprMusic as requestCliprMusicGeneration } from "@/lib/clipstitchr/client/generateCliprMusic";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { ClipLibraryValue } from "@/lib/clipstitchr/types/ClipLibraryValue";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

export function useClipLibraryState(): ClipLibraryValue {
  const convex = useConvex();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const clipDocuments = useQuery(
    api.videoClips.list,
    isAuthenticated ? {} : "skip",
  );
  const stitchDocuments = useQuery(
    api.stitches.list,
    isAuthenticated ? {} : "skip",
  );
  const updateClipMetadataMutation = useMutation(api.videoClips.updateMetadata);
  const updateCliprMusicMutation = useMutation(api.videoClips.updateCliprMusic);
  const removeClipMutation = useMutation(api.videoClips.remove);
  const removeStitchMutation = useMutation(api.stitches.remove);
  const [clips, setClips] = useState<VideoClipMetadata[]>([]);
  const [stitches, setStitches] = useState<Stitch[]>([]);
  const [isHydrating, setIsHydrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const clipCacheRef = useRef(new Map<string, VideoClip>());

  const refresh = useCallback(async () => {
    setRefreshNonce((currentNonce) => currentNonce + 1);
  }, []);

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

    const hydratedClipMetadata = clips.find((clip) => clip.id === id);
    const [blob, posterBlob] = await Promise.all([
      downloadBlobFromR2(clipDocument.videoObject),
      hydratedClipMetadata?.posterBlob
        ? Promise.resolve(hydratedClipMetadata.posterBlob)
        : clipDocument.posterObject
          ? downloadBlobFromR2(clipDocument.posterObject)
          : Promise.resolve(undefined),
    ]);
    const clip = createVideoClipFromConvexDocument({
      clip: clipDocument,
      blob,
      posterBlob,
    });

    clipCacheRef.current.set(id, clip);
    return clip;
  }, [clips, convex, clipDocuments]);

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
            clipDocument.cliprMetadata?.music?.audioObject,
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
          ]),
        );
      }

      await removeStitchMutation({ id });
      await refresh();
    },
    [convex, refresh, removeStitchMutation, stitchDocuments],
  );

  useEffect(() => {
    if (
      isAuthLoading ||
      !isAuthenticated ||
      !clipDocuments ||
      !stitchDocuments
    ) {
      if (!isAuthLoading && !isAuthenticated) {
        void Promise.resolve().then(() => {
          setClips([]);
          setStitches([]);
        });
      }

      return;
    }

    let isCancelled = false;

    void Promise.resolve().then(async () => {
      if (isCancelled) {
        return;
      }

      setIsHydrating(true);
      setError(null);

      try {
        const [nextClips, nextStitches] = await Promise.all([
          Promise.all(
            clipDocuments.map(async (clip) => {
              const posterBlob = clip.posterObject
                ? await downloadBlobFromR2(clip.posterObject).catch(
                    () => undefined,
                  )
                : undefined;

              return createVideoClipMetadataFromConvexDocument(
                clip,
                posterBlob,
              );
            }),
          ),
          Promise.all(
            stitchDocuments.map(async (stitch) => {
              const [blob, posterBlob] = await Promise.all([
                downloadBlobFromR2(stitch.stitchObject),
                stitch.posterObject
                  ? downloadBlobFromR2(stitch.posterObject).catch(
                      () => undefined,
                    )
                  : Promise.resolve(undefined),
              ]);

              return createStitchFromConvexDocument({
                stitch,
                blob,
                posterBlob,
              });
            }),
          ),
        ]);

        if (!isCancelled) {
          setClips(nextClips);
          setStitches(nextStitches);
        }
      } catch (nextError) {
        if (!isCancelled) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "Unable to load the ClipStitchr library.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsHydrating(false);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [
    clipDocuments,
    isAuthenticated,
    isAuthLoading,
    refreshNonce,
    stitchDocuments,
  ]);

  return {
    clips,
    stitches,
    isLoading:
      isAuthLoading ||
      (isAuthenticated &&
        (clipDocuments === undefined || stitchDocuments === undefined)) ||
      isHydrating,
    error,
    refresh,
    loadClip,
    removeClip,
    renameClip,
    updateClipMetadata,
    generateCliprMusic,
    updateCliprMusic,
    updateClipTrimRange,
    removeStitch,
  };
}
