"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { generateStitchMusic as requestStitchMusicGeneration } from "@/lib/clipstitchr/client/generateStitchMusic";
import { createVideoPosterBlob } from "@/lib/clipstitchr/media/createVideoPosterBlob";
import { stitchNormalizedVideos } from "@/lib/clipstitchr/media/stitchNormalizedVideos";
import { stitchNormalizedVideosWithTextOverlay } from "@/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import type { StitchrUgcSelection } from "@/lib/clipstitchr/types/StitchrUgcSelection";
import type { StitchSourceAudioOptions } from "@/lib/clipstitchr/types/StitchSourceAudioOptions";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createStitchMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createStitchMusicMetadataFromSharedTrack";
import { getDownloadFileName } from "@/lib/clipstitchr/utils/getDownloadFileName";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type UseStitchrOptions = {
  onCreated?: () => void | Promise<void>;
};

type StitchrBuildOptions = {
  addMusic?: boolean;
  musicTrack?: SharedMusicTrack | null;
} & StitchSourceAudioOptions;

export function useStitchr({ onCreated }: UseStitchrOptions) {
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
      ugcClip: VideoClip,
      demoClip: VideoClip,
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
      const stitched = textOverlay
        ? await stitchNormalizedVideosWithTextOverlay(ugcClip, demoClip, {
            ugcTrimRange: clampedUgcTrimRange,
            demoTrimRange: clampedDemoTrimRange,
            includeDemoAudio: options.includeDemoAudio,
            includeUgcAudio: options.includeUgcAudio,
            textOverlay,
            onProgress: onPairProgress,
          })
        : await stitchNormalizedVideos(ugcClip, demoClip, {
            ugcTrimRange: clampedUgcTrimRange,
            demoTrimRange: clampedDemoTrimRange,
            includeDemoAudio: options.includeDemoAudio,
            includeUgcAudio: options.includeUgcAudio,
            onProgress: onPairProgress,
          });
      let posterBlob: Blob | undefined;

      try {
        posterBlob = await createVideoPosterBlob(stitched.blob);
      } catch {
        posterBlob = undefined;
      }

      const now = new Date().toISOString();
      const stitchId = createId();
      const [stitchObject, posterObject] = await uploadBlobsToR2([
        {
          blob: stitched.blob,
          kind: "stitch-video",
          recordId: stitchId,
        },
        ...(posterBlob
          ? [
              {
                blob: posterBlob,
                kind: "stitch-poster" as const,
                recordId: stitchId,
              },
            ]
          : []),
      ]);
      const nextStitch: Stitch = {
        id: stitchId,
        name: getDownloadFileName(ugcClip.name, demoClip.name),
        ugcClipId: ugcClip.id,
        demoClipId: demoClip.id,
        ugcClipName: ugcClip.name,
        demoClipName: demoClip.name,
        ugcTrimRange: clampedUgcTrimRange,
        demoTrimRange: clampedDemoTrimRange,
        stitchObject,
        blob: stitched.blob,
        posterObject,
        posterBlob,
        posterVersion: posterBlob ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
        mimeType: stitched.mimeType,
        size: stitched.blob.size,
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
        duration: stitched.duration,
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
        stitchObject: nextStitch.stitchObject,
        posterObject: nextStitch.posterObject,
        posterVersion: nextStitch.posterVersion,
        mimeType: nextStitch.mimeType,
        size: nextStitch.size,
        width: nextStitch.width,
        height: nextStitch.height,
        duration: nextStitch.duration,
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
    [saveStitch, updateStitchMusic],
  );

  const stitchVideos = useCallback(
    async (
      ugcSelections: StitchrUgcSelection[],
      demoClip: VideoClip,
      demoTrimRange: VideoTrimRange,
      textOverlay: TextOverlay | null = null,
      options: StitchrBuildOptions = {},
    ) => {
      setStatus("reading");
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

          setStatus("reading");

          const ugcClip = await ugcSelection.loadClip();

          if (!ugcClip) {
            throw new Error(`Unable to load ${ugcSelection.clip.name}.`);
          }

          const clampedUgcTrimRange = clampVideoTrimRange(
            ugcSelection.trimRange,
            ugcClip.duration,
          );
          const ugcDuration = getVideoTrimRangeDuration(clampedUgcTrimRange);
          const pairTextOverlay =
            textOverlay && textOverlay.text.trim().length > 0
              ? clampTextOverlay(textOverlay, ugcDuration + demoDuration)
              : null;

          setStatus("stitching");

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
            loadClip: async () => ugcClip,
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
