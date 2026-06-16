"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import { createRenderedStitchVideoUpload } from "@/lib/clipstitchr/client/createRenderedStitchVideoUpload";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { createStitchPosterBlob } from "@/lib/clipstitchr/media/createStitchPosterBlob";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { SourcePlaybackRateOptions } from "@/lib/clipstitchr/types/SourcePlaybackRateOptions";
import type { StitchrLongrSelection } from "@/lib/clipstitchr/types/StitchrLongrSelection";
import type { StitchrUgcSelection } from "@/lib/clipstitchr/types/StitchrUgcSelection";
import type { StitchSourceAudioOptions } from "@/lib/clipstitchr/types/StitchSourceAudioOptions";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createQuickEditSuggestionsFromMetadata } from "@/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { createStitchMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createStitchMusicMetadataFromSharedTrack";
import { createStitchSequenceSegment } from "@/lib/clipstitchr/utils/createStitchSequenceSegment";
import { getDownloadFileName } from "@/lib/clipstitchr/utils/getDownloadFileName";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getLongrStitchFileName } from "@/lib/clipstitchr/utils/getLongrStitchFileName";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";

type UseStitchrOptions = {
  loadClip?: (id: string) => Promise<VideoClip | null>;
  onCreated?: () => void | Promise<void>;
};

type StitchrBuildOptions = {
  musicTrack?: SharedMusicTrack | null;
  socialCaption?: string;
} & SourcePlaybackRateOptions &
  StitchSourceAudioOptions;

export function useStitchr({ loadClip, onCreated }: UseStitchrOptions) {
  const saveStitch = useMutation(api.stitches.save);
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
      textOverlays: TextOverlay[] = [],
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
      const ugcPlaybackRate = options.ugcPlaybackRate ?? 1;
      const demoPlaybackRate = options.demoPlaybackRate ?? 1;
      const ugcQuickEdit = createQuickEditSuggestionsFromMetadata(
        ugcClip.quickEdit,
      );
      const demoQuickEdit = createQuickEditSuggestionsFromMetadata(
        demoClip.quickEdit,
      );
      const duration =
        getQuickEditPlaybackDuration(
          clampedUgcTrimRange,
          ugcClip.duration,
          ugcQuickEdit?.removeRanges,
          ugcPlaybackRate,
        ) +
        getQuickEditPlaybackDuration(
          clampedDemoTrimRange,
          demoClip.duration,
          demoQuickEdit?.removeRanges,
          demoPlaybackRate,
        );
      const now = new Date().toISOString();
      const stitchId = createId();
      const firstTextOverlay = textOverlays[0];
      let posterBlob = ugcClip.posterBlob;
      let posterObject: R2ObjectReference | undefined;
      const selectedMusic = options.musicTrack
        ? createStitchMusicMetadataFromSharedTrack(options.musicTrack)
        : null;

      if (textOverlays.length && loadClip) {
        try {
          const [loadedUgcClip, loadedDemoClip] = await Promise.all([
            loadClip(ugcClip.id),
            loadClip(demoClip.id),
          ]);

          if (loadedUgcClip && loadedDemoClip) {
            posterBlob = await createStitchPosterBlob({
              demoClip: loadedDemoClip,
              demoPlaybackRate,
              demoQuickEdit,
              demoTrimRange: clampedDemoTrimRange,
              duration,
              textOverlay: firstTextOverlay ?? null,
              textOverlays,
              ugcClip: loadedUgcClip,
              ugcPlaybackRate,
              ugcQuickEdit,
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
        mode: "normal",
        name: getDownloadFileName(ugcClip.name, demoClip.name),
        ugcClipId: ugcClip.id,
        demoClipId: demoClip.id,
        ugcClipName: ugcClip.name,
        demoClipName: demoClip.name,
        ugcTrimRange: clampedUgcTrimRange,
        demoTrimRange: clampedDemoTrimRange,
        demoQuickEdit,
        ugcQuickEdit,
        posterBlob,
        posterObject,
        posterVersion: posterObject ? VIDEO_POSTER_CAPTURE_VERSION : undefined,
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
        duration,
        includeDemoAudio: options.includeDemoAudio ?? false,
        includeUgcAudio: options.includeUgcAudio ?? false,
        demoPlaybackRate,
        ugcPlaybackRate,
        music: selectedMusic ?? undefined,
        textOverlay: firstTextOverlay,
        textOverlays: textOverlays.length ? textOverlays : undefined,
        socialCaption: options.socialCaption?.trim() || undefined,
        createdAt: now,
      };
      const renderLoadClip = async (id: string) => {
        if (id === ugcClip.id && "blob" in ugcClip) {
          return ugcClip as VideoClip;
        }

        if (id === demoClip.id && "blob" in demoClip) {
          return demoClip as VideoClip;
        }

        return (await loadClip?.(id)) ?? null;
      };

      const renderedVideo = await createRenderedStitchVideoUpload({
        loadClip: renderLoadClip,
        onProgress: (progress) => onPairProgress?.(progress * 0.9),
        stitch: nextStitch,
      });

      nextStitch.blob = renderedVideo.blob;
      nextStitch.mimeType = renderedVideo.mimeType;
      nextStitch.size = renderedVideo.size;
      nextStitch.stitchObject = renderedVideo.stitchObject;

      await saveStitch({
        id: nextStitch.id,
        mode: nextStitch.mode,
        name: nextStitch.name,
        ugcClipId: nextStitch.ugcClipId,
        demoClipId: nextStitch.demoClipId,
        ugcClipName: nextStitch.ugcClipName,
        demoClipName: nextStitch.demoClipName,
        ugcTrimRange: nextStitch.ugcTrimRange,
        demoTrimRange: nextStitch.demoTrimRange,
        demoQuickEdit: nextStitch.demoQuickEdit,
        ugcQuickEdit: nextStitch.ugcQuickEdit,
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
        demoPlaybackRate: nextStitch.demoPlaybackRate,
        ugcPlaybackRate: nextStitch.ugcPlaybackRate,
        ...(nextStitch.stitchObject
          ? {
              mimeType: nextStitch.mimeType,
              size: nextStitch.size,
              stitchObject: nextStitch.stitchObject,
            }
          : {}),
        ...(nextStitch.music ? { music: nextStitch.music } : {}),
        textOverlay: nextStitch.textOverlay,
        textOverlays: nextStitch.textOverlays,
        ...(nextStitch.socialCaption
          ? { socialCaption: nextStitch.socialCaption }
          : {}),
        createdAt: nextStitch.createdAt,
      });

      onPairProgress?.(1);

      return nextStitch;
    },
    [loadClip, saveStitch],
  );

  const createLongrStitch = useCallback(
    async (
      selections: StitchrLongrSelection[],
      textOverlays: TextOverlay[] = [],
      options: StitchrBuildOptions = {},
      onPairProgress?: (progress: number) => void,
    ) => {
      if (!selections.length) {
        throw new Error("Select at least one source clip before stitching.");
      }

      const segments = selections.map((selection, index) =>
        createStitchSequenceSegment({
          clip: selection.clip,
          order: index,
          playbackRate: selection.playbackRate ?? 1,
          trimRange: selection.trimRange,
        }),
      );
      const duration = segments.reduce(
        (total, segment) => total + segment.duration,
        0,
      );
      const representativeUgc =
        selections.find((selection) => selection.clip.clipType !== "demo") ??
        selections[0];
      const representativeDemo =
        selections.find((selection) => selection.clip.clipType === "demo") ??
        selections[selections.length - 1] ??
        selections[0];
      const now = new Date().toISOString();
      const stitchId = createId();
      const firstTextOverlay = textOverlays[0];
      const selectedMusic = options.musicTrack
        ? createStitchMusicMetadataFromSharedTrack(options.musicTrack)
        : null;
      const nextStitch: Stitch = {
        id: stitchId,
        mode: "longr",
        name: getLongrStitchFileName(),
        ugcClipId: representativeUgc.clip.id,
        demoClipId: representativeDemo.clip.id,
        ugcClipName: representativeUgc.clip.name,
        demoClipName: representativeDemo.clip.name,
        ugcTrimRange: clampVideoTrimRange(
          representativeUgc.trimRange,
          representativeUgc.clip.duration,
        ),
        demoTrimRange: clampVideoTrimRange(
          representativeDemo.trimRange,
          representativeDemo.clip.duration,
        ),
        sequenceSegments: segments,
        posterBlob: selections[0]?.clip.posterBlob,
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
        duration,
        includeDemoAudio: options.includeDemoAudio ?? false,
        includeUgcAudio: options.includeUgcAudio ?? false,
        demoPlaybackRate: options.demoPlaybackRate ?? 1,
        ugcPlaybackRate: options.ugcPlaybackRate ?? 1,
        music: selectedMusic ?? undefined,
        textOverlay: firstTextOverlay,
        textOverlays: textOverlays.length ? textOverlays : undefined,
        socialCaption: options.socialCaption?.trim() || undefined,
        createdAt: now,
      };
      const renderLoadClip = async (id: string) => (await loadClip?.(id)) ?? null;

      const renderedVideo = await createRenderedStitchVideoUpload({
        loadClip: renderLoadClip,
        onProgress: (progress) => onPairProgress?.(progress * 0.9),
        stitch: nextStitch,
      });

      nextStitch.blob = renderedVideo.blob;
      nextStitch.mimeType = renderedVideo.mimeType;
      nextStitch.size = renderedVideo.size;
      nextStitch.stitchObject = renderedVideo.stitchObject;

      await saveStitch({
        id: nextStitch.id,
        mode: nextStitch.mode,
        name: nextStitch.name,
        ugcClipId: nextStitch.ugcClipId,
        demoClipId: nextStitch.demoClipId,
        ugcClipName: nextStitch.ugcClipName,
        demoClipName: nextStitch.demoClipName,
        ugcTrimRange: nextStitch.ugcTrimRange,
        demoTrimRange: nextStitch.demoTrimRange,
        sequenceSegments: nextStitch.sequenceSegments,
        demoQuickEdit: nextStitch.demoQuickEdit,
        ugcQuickEdit: nextStitch.ugcQuickEdit,
        width: nextStitch.width,
        height: nextStitch.height,
        duration: nextStitch.duration,
        includeDemoAudio: nextStitch.includeDemoAudio,
        includeUgcAudio: nextStitch.includeUgcAudio,
        demoPlaybackRate: nextStitch.demoPlaybackRate,
        ugcPlaybackRate: nextStitch.ugcPlaybackRate,
        ...(nextStitch.stitchObject
          ? {
              mimeType: nextStitch.mimeType,
              size: nextStitch.size,
              stitchObject: nextStitch.stitchObject,
            }
          : {}),
        ...(nextStitch.music ? { music: nextStitch.music } : {}),
        textOverlay: nextStitch.textOverlay,
        textOverlays: nextStitch.textOverlays,
        ...(nextStitch.socialCaption
          ? { socialCaption: nextStitch.socialCaption }
          : {}),
        createdAt: nextStitch.createdAt,
      });

      onPairProgress?.(1);

      return nextStitch;
    },
    [loadClip, saveStitch],
  );

  const stitchVideos = useCallback(
    async (
      ugcSelections: StitchrUgcSelection[],
      demoClip: VideoClipMetadata,
      demoTrimRange: VideoTrimRange,
      textOverlay: TextOverlay | TextOverlay[] | null = null,
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
        const demoQuickEdit = createQuickEditSuggestionsFromMetadata(
          demoClip.quickEdit,
        );
        const demoDuration = getQuickEditPlaybackDuration(
          clampedDemoTrimRange,
          demoClip.duration,
          demoQuickEdit?.removeRanges,
          options.demoPlaybackRate ?? 1,
        );

        for (let index = 0; index < ugcSelections.length; index += 1) {
          const ugcSelection = ugcSelections[index];
          const ugcClip = ugcSelection.clip;

          const clampedUgcTrimRange = clampVideoTrimRange(
            ugcSelection.trimRange,
            ugcClip.duration,
          );
          const ugcQuickEdit = createQuickEditSuggestionsFromMetadata(
            ugcClip.quickEdit,
          );
          const ugcDuration = getQuickEditPlaybackDuration(
            clampedUgcTrimRange,
            ugcClip.duration,
            ugcQuickEdit?.removeRanges,
            options.ugcPlaybackRate ?? 1,
          );
          const selectionTextOverlay =
            "textOverlay" in ugcSelection
              ? ugcSelection.textOverlay
              : textOverlay;
          const selectionTextOverlays =
            ugcSelection.textOverlays ??
            (Array.isArray(selectionTextOverlay)
              ? selectionTextOverlay
              : getTextOverlayList(undefined, selectionTextOverlay));
          const pairTextOverlays = getNonEmptyTextOverlays(
            clampTextOverlays(
              selectionTextOverlays,
              ugcDuration + demoDuration,
            ),
          );
          const selectionSocialCaption =
            "socialCaption" in ugcSelection
              ? ugcSelection.socialCaption
              : options.socialCaption;

          setStatus("saving");

          const nextStitch = await createStitch(
            ugcClip,
            demoClip,
            clampedUgcTrimRange,
            clampedDemoTrimRange,
            pairTextOverlays,
            {
              ...options,
              socialCaption: selectionSocialCaption,
            },
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

  const stitchLongrSequence = useCallback(
    async (
      selections: StitchrLongrSelection[],
      textOverlay: TextOverlay | TextOverlay[] | null = null,
      options: StitchrBuildOptions = {},
    ) => {
      setStatus("saving");
      setProgress(0);
      setError(null);
      setStitch(null);
      setStitches([]);
      setCompletedCount(0);
      setTotalCount(1);

      if (!selections.length) {
        setStatus("error");
        setError("Select at least one source clip before stitching.");
        return null;
      }

      try {
        const totalDuration = selections.reduce(
          (total, selection) =>
            total +
            getQuickEditPlaybackDuration(
              clampVideoTrimRange(selection.trimRange, selection.clip.duration),
              selection.clip.duration,
              selection.clip.quickEdit?.removeRanges,
              selection.playbackRate ?? 1,
            ),
          0,
        );
        const sourceTextOverlays = Array.isArray(textOverlay)
          ? textOverlay
          : getTextOverlayList(undefined, textOverlay);
        const nextTextOverlays = getNonEmptyTextOverlays(
          clampTextOverlays(sourceTextOverlays, totalDuration),
        );
        const nextStitch = await createLongrStitch(
          selections,
          nextTextOverlays,
          options,
          setProgress,
        );

        await onCreated?.();

        setStitch(nextStitch);
        setStitches([nextStitch]);
        setCompletedCount(1);
        setProgress(1);
        setStatus("complete");

        return nextStitch;
      } catch (nextError) {
        setStatus("error");
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to stitch the videos.",
        );
        return null;
      }
    },
    [createLongrStitch, onCreated],
  );

  const stitchVideo = useCallback(
    async (
      ugcClip: VideoClip,
      demoClip: VideoClip,
      ugcTrimRange: VideoTrimRange,
      demoTrimRange: VideoTrimRange,
      textOverlay: TextOverlay | TextOverlay[] | null = null,
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
    stitchLongrSequence,
    stitchVideo,
    stitchVideos,
  };
}
