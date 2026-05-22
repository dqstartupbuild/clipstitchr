"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { generateStitchMusic as requestStitchMusicGeneration } from "@/lib/clipstitchr/client/generateStitchMusic";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { createStitchPosterBlob } from "@/lib/clipstitchr/media/createStitchPosterBlob";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { StitchrUgcSelection } from "@/lib/clipstitchr/types/StitchrUgcSelection";
import type { StitchSourceAudioOptions } from "@/lib/clipstitchr/types/StitchSourceAudioOptions";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createStitchMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createStitchMusicMetadataFromSharedTrack";
import { getDownloadFileName } from "@/lib/clipstitchr/utils/getDownloadFileName";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type UseStitchrOptions = {
  loadClip?: (id: string) => Promise<VideoClip | null>;
  onCreated?: () => void | Promise<void>;
};

type StitchrBuildOptions = {
  addMusic?: boolean;
  musicTrack?: SharedMusicTrack | null;
} & StitchSourceAudioOptions;

export function useStitchr({ loadClip, onCreated }: UseStitchrOptions) {
  const saveStitch = useMutation(api.stitches.save);
  const updateStitchMusic = useMutation(api.stitches.updateMusic);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stitch, setStitch] = useState<Stitch | null>(null);
  const [stitches, setStitches] = useState<Stitch[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const createStitch = useCallback(
    async (
      ugcClip: VideoClipMetadata,
      demoClip: VideoClipMetadata,
      ugcTrimRange: VideoTrimRange,
      demoTrimRange: VideoTrimRange,
      textOverlay: TextOverlay | null = null,
      options: StitchrBuildOptions = {},
      onPairProgress?: (progress: number) => void,
    ) => {
      const clampedUgcTrimRange = clampVideoTrimRange(
        ugcTrimRange,
        ugcClip.duration,
      );
      const clampedDemoTrimRange = clampVideoTrimRange(
        demoTrimRange,
        demoClip.duration,
      );
      const duration =
        getVideoTrimRangeDuration(clampedUgcTrimRange) +
        getVideoTrimRangeDuration(clampedDemoTrimRange);
      const now = new Date().toISOString();
      const stitchId = createId();
      let posterBlob = ugcClip.posterBlob;
      let posterObject: R2ObjectReference | undefined;

      if (textOverlay?.text.trim() && loadClip) {
        try {
          const [loadedUgcClip, loadedDemoClip] = await Promise.all([
            loadClip(ugcClip.id),
            loadClip(demoClip.id),
          ]);

          if (loadedUgcClip && loadedDemoClip) {
            posterBlob = await createStitchPosterBlob({
              demoClip: loadedDemoClip,
              demoTrimRange: clampedDemoTrimRange,
              duration,
              textOverlay,
              ugcClip: loadedUgcClip,
              ugcTrimRange: clampedUgcTrimRange,
            });
            [posterObject] = await uploadBlobsToR2([
              {
                blob: posterBlob,
                kind: "stitch-poster",
                recordId: stitchId,
              },
            ]);
          }
        } catch {
          posterBlob = ugcClip.posterBlob;
          posterObject = undefined;
        }
      }

      const nextStitch: Stitch = {
        id: stitchId,
        name: getDownloadFileName(ugcClip.name, demoClip.name),
        ugcClipId: ugcClip.id,
        demoClipId: demoClip.id,
        ugcClipName: ugcClip.name,
        demoClipName: demoClip.name,
        ugcTrimRange: clampedUgcTrimRange,
        demoTrimRange: clampedDemoTrimRange,
        posterBlob,
        posterObject,
        posterVersion: posterObject ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
        duration,
        includeDemoAudio: options.includeDemoAudio ?? true,
        includeUgcAudio: options.includeUgcAudio ?? true,
        textOverlay: textOverlay ?? undefined,
        createdAt: now,
      };

      await saveStitch({
        id: nextStitch.id,
        name: nextStitch.name,
        ugcClipId: nextStitch.ugcClipId,
        demoClipId: nextStitch.demoClipId,
        ugcClipName: nextStitch.ugcClipName,
        demoClipName: nextStitch.demoClipName,
        ugcTrimRange: nextStitch.ugcTrimRange,
        demoTrimRange: nextStitch.demoTrimRange,
        ...(nextStitch.posterObject
          ? {
              posterObject: nextStitch.posterObject,
              posterVersion: nextStitch.posterVersion,
            }
          : {}),
        width: nextStitch.width,
        height: nextStitch.height,
        duration: nextStitch.duration,
        includeDemoAudio: nextStitch.includeDemoAudio,
        includeUgcAudio: nextStitch.includeUgcAudio,
        textOverlay: nextStitch.textOverlay,
        createdAt: nextStitch.createdAt,
      });

      const selectedMusic = options.musicTrack
        ? createStitchMusicMetadataFromSharedTrack(options.musicTrack)
        : null;

      if (selectedMusic || options.addMusic) {
        const music =
          selectedMusic ??
          (await requestStitchMusicGeneration({
            stitchId: nextStitch.id,
          }));

        await updateStitchMusic({
          id: nextStitch.id,
          music,
        });
        nextStitch.music = music;
      }

      onPairProgress?.(1);

      return nextStitch;
    },
    [loadClip, saveStitch, updateStitchMusic],
  );

  const stitchVideos = useCallback(
    async (
      ugcSelections: StitchrUgcSelection[],
      demoClip: VideoClipMetadata,
      demoTrimRange: VideoTrimRange,
      textOverlay: TextOverlay | null = null,
      options: StitchrBuildOptions = {},
    ) => {
      setStatus("saving");
      setProgress(0);
      setError(null);
      setStitch(null);
      setStitches([]);
      setCompletedCount(0);
      setTotalCount(ugcSelections.length);

      if (!ugcSelections.length) {
        setStatus("error");
        setError("Select at least one UGC clip before stitching.");
        return [];
      }

      const nextStitches: Stitch[] = [];

      try {
        const clampedDemoTrimRange = clampVideoTrimRange(
          demoTrimRange,
          demoClip.duration,
        );
        const demoDuration = getVideoTrimRangeDuration(clampedDemoTrimRange);

        for (let index = 0; index < ugcSelections.length; index += 1) {
          const ugcSelection = ugcSelections[index];
          const ugcClip = ugcSelection.clip;

          const clampedUgcTrimRange = clampVideoTrimRange(
            ugcSelection.trimRange,
            ugcClip.duration,
          );
          const ugcDuration = getVideoTrimRangeDuration(clampedUgcTrimRange);
          const selectionTextOverlay =
            "textOverlay" in ugcSelection
              ? ugcSelection.textOverlay
              : textOverlay;
          const pairTextOverlay =
            selectionTextOverlay &&
            selectionTextOverlay.text.trim().length > 0
              ? clampTextOverlay(
                  selectionTextOverlay,
                  ugcDuration + demoDuration,
                )
              : null;

          setStatus("saving");

          const nextStitch = await createStitch(
            ugcClip,
            demoClip,
            clampedUgcTrimRange,
            clampedDemoTrimRange,
            pairTextOverlay,
            options,
            (pairProgress) => {
              setProgress((index + pairProgress) / ugcSelections.length);
            },
          );

          nextStitches.push(nextStitch);
          setStitch(nextStitch);
          setStitches([...nextStitches]);
          setCompletedCount(nextStitches.length);
          setProgress(nextStitches.length / ugcSelections.length);
        }

        await onCreated?.();

        setProgress(1);
        setStatus("complete");

        return nextStitches;
      } catch (nextError) {
        setStatus("error");
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to stitch the videos.",
        );
        return nextStitches;
      }
    },
    [createStitch, onCreated],
  );

  const stitchVideo = useCallback(
    async (
      ugcClip: VideoClip,
      demoClip: VideoClip,
      ugcTrimRange: VideoTrimRange,
      demoTrimRange: VideoTrimRange,
      textOverlay: TextOverlay | null = null,
      options: StitchrBuildOptions = {},
    ) => {
      const [nextStitch] = await stitchVideos(
        [
          {
            clip: ugcClip,
            trimRange: ugcTrimRange,
          },
        ],
        demoClip,
        demoTrimRange,
        textOverlay,
        options,
      );

      return nextStitch ?? null;
    },
    [stitchVideos],
  );

  return {
    status,
    progress,
    error,
    stitch,
    stitches,
    completedCount,
    totalCount,
    stitchVideo,
    stitchVideos,
  };
}
