import type { CanvasSource, VideoSampleSource } from "mediabunny";
import { assertNormalizedAudioParameters } from "@/lib/clipstitchr/media/assertNormalizedAudioParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { copyAudioSamplesToSource } from "@/lib/clipstitchr/media/copyAudioSamplesToSource";
import { copyTextOverlayVideoFramesToSource } from "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource";
import { copyVideoSamplesToSource } from "@/lib/clipstitchr/media/copyVideoSamplesToSource";
import { createMediaBunnyExportSession } from "@/lib/clipstitchr/media/createMediaBunnyExportSession";
import { createMediaBunnyProgressMapper } from "@/lib/clipstitchr/media/createMediaBunnyProgressMapper";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createOutputAudioBufferSource } from "@/lib/clipstitchr/media/createOutputAudioBufferSource";
import { createOutputAudioSampleSource } from "@/lib/clipstitchr/media/createOutputAudioSampleSource";
import { createStitchSourceAudioBuffer } from "@/lib/clipstitchr/media/createStitchSourceAudioBuffer";
import { createTextOverlayRenderContext } from "@/lib/clipstitchr/media/createTextOverlayRenderContext";
import { createTikTokCanvasSource } from "@/lib/clipstitchr/media/createTikTokCanvasSource";
import { createTikTokVideoSampleSource } from "@/lib/clipstitchr/media/createTikTokVideoSampleSource";
import { finalizeMediaBunnyExportSession } from "@/lib/clipstitchr/media/finalizeMediaBunnyExportSession";
import { getInputAudioParameters } from "@/lib/clipstitchr/media/getInputAudioParameters";
import { resolveMediaBunnyOutputCodecs } from "@/lib/clipstitchr/media/resolveMediaBunnyOutputCodecs";
import type { SourcePlaybackRateOptions } from "@/lib/clipstitchr/types/SourcePlaybackRateOptions";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { StitchSourceAudioOptions } from "@/lib/clipstitchr/types/StitchSourceAudioOptions";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoCropBounds } from "@/lib/clipstitchr/utils/clampVideoCropBounds";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoCropBoundsIsNeutral } from "@/lib/clipstitchr/utils/getVideoCropBoundsIsNeutral";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type StitchNormalizedVideosResult = {
  blob: Blob;
  mimeType: string;
  duration: number;
};

type StitchNormalizedVideosOptions = {
  ugcTrimRange: VideoTrimRange;
  demoTrimRange: VideoTrimRange;
  ugcCropBounds?: VideoCropBounds;
  demoCropBounds?: VideoCropBounds;
  onProgress?: (progress: number) => void;
} & SourcePlaybackRateOptions &
  StitchSourceAudioOptions;

export async function stitchNormalizedVideos(
  ugcClip: VideoClip,
  demoClip: VideoClip,
  {
    ugcTrimRange,
    demoTrimRange,
    ugcCropBounds,
    demoCropBounds,
    demoPlaybackRate = 1,
    includeDemoAudio = true,
    includeUgcAudio = true,
    onProgress,
    ugcPlaybackRate = 1,
  }: StitchNormalizedVideosOptions,
): Promise<StitchNormalizedVideosResult> {
  const ugcInput = createMediaInput(ugcClip.blob);
  const demoInput = createMediaInput(demoClip.blob);

  try {
    const [ugcAudioParameters, demoAudioParameters] = await Promise.all([
      includeUgcAudio ? getInputAudioParameters(ugcInput) : null,
      includeDemoAudio ? getInputAudioParameters(demoInput) : null,
    ]);
    const clampedUgcTrimRange = clampVideoTrimRange(
      ugcTrimRange,
      ugcClip.duration,
    );
    const clampedDemoTrimRange = clampVideoTrimRange(
      demoTrimRange,
      demoClip.duration,
    );
    const clampedUgcCropBounds = clampVideoCropBounds(
      ugcCropBounds ?? ugcClip.defaultCropBounds ?? {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      },
    );
    const clampedDemoCropBounds = clampVideoCropBounds(
      demoCropBounds ?? demoClip.defaultCropBounds ?? {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      },
    );
    const hasVideoCrop =
      !getVideoCropBoundsIsNeutral(clampedUgcCropBounds) ||
      !getVideoCropBoundsIsNeutral(clampedDemoCropBounds);
    const ugcDuration = getPlaybackRateDuration(
      clampedUgcTrimRange,
      ugcPlaybackRate,
    );
    const demoDuration = getPlaybackRateDuration(
      clampedDemoTrimRange,
      demoPlaybackRate,
    );
    const includeAudio = Boolean(ugcAudioParameters || demoAudioParameters);
    const usesPlaybackRateAudioBuffer =
      includeAudio && (ugcPlaybackRate !== 1 || demoPlaybackRate !== 1);

    assertNormalizedAudioParameters({
      audioParameters: ugcAudioParameters,
      subject: "One selected clip",
      workflow: "stitching",
    });
    assertNormalizedAudioParameters({
      audioParameters: demoAudioParameters,
      subject: "One selected clip",
      workflow: "stitching",
    });

    const codecs = await resolveMediaBunnyOutputCodecs(
      includeAudio,
      "No supported audio encoder found for this export.",
    );
    const audioBufferSource = createOutputAudioBufferSource(
      usesPlaybackRateAudioBuffer,
      codecs.audioCodec,
    );
    const audioSampleSource = createOutputAudioSampleSource(
      includeAudio && !usesPlaybackRateAudioBuffer,
      codecs.audioCodec,
    );
    const renderContext = hasVideoCrop
      ? createTextOverlayRenderContext(TIKTOK_OUTPUT_WIDTH, TIKTOK_OUTPUT_HEIGHT)
      : null;
    const session = await createMediaBunnyExportSession({
      audioSource: audioBufferSource ?? audioSampleSource,
      videoSource: renderContext
        ? createTikTokCanvasSource(renderContext.canvas, codecs.videoCodec)
        : createTikTokVideoSampleSource(codecs.videoCodec),
    });

    const ugcVideo = renderContext
      ? await copyTextOverlayVideoFramesToSource({
          input: ugcInput,
          playbackRate: ugcPlaybackRate,
          source: session.videoSource as CanvasSource,
          renderContext,
          timelineOffset: 0,
          trimRange: clampedUgcTrimRange,
          cropBounds: clampedUgcCropBounds,
          textOverlays: [],
          onProgress: createMediaBunnyProgressMapper(onProgress, 0, 0.35),
        })
      : await copyVideoSamplesToSource({
          input: ugcInput,
          playbackRate: ugcPlaybackRate,
          source: session.videoSource as VideoSampleSource,
          timelineOffset: 0,
          trimRange: clampedUgcTrimRange,
          onProgress: createMediaBunnyProgressMapper(onProgress, 0, 0.35),
        });
    const demoTimelineOffset = Math.max(ugcDuration, ugcVideo.endTimestamp);
    const demoVideo = renderContext
      ? await copyTextOverlayVideoFramesToSource({
          input: demoInput,
          playbackRate: demoPlaybackRate,
          source: session.videoSource as CanvasSource,
          renderContext,
          timelineOffset: demoTimelineOffset,
          trimRange: clampedDemoTrimRange,
          cropBounds: clampedDemoCropBounds,
          textOverlays: [],
          onProgress: createMediaBunnyProgressMapper(onProgress, 0.35, 0.35),
        })
      : await copyVideoSamplesToSource({
          input: demoInput,
          playbackRate: demoPlaybackRate,
          source: session.videoSource as VideoSampleSource,
          timelineOffset: demoTimelineOffset,
          trimRange: clampedDemoTrimRange,
          onProgress: createMediaBunnyProgressMapper(onProgress, 0.35, 0.35),
        });
    let endTimestamp = Math.max(ugcVideo.endTimestamp, demoVideo.endTimestamp);

    if (audioBufferSource) {
      const outputDuration = Math.max(
        endTimestamp,
        demoTimelineOffset + demoDuration,
        ugcDuration + demoDuration,
      );
      const audioBuffer = await createStitchSourceAudioBuffer({
        demoInput,
        demoPlaybackRate,
        demoTimelineOffset,
        demoTrimRange: clampedDemoTrimRange,
        includeDemoAudio,
        includeUgcAudio,
        outputDuration,
        ugcInput,
        ugcPlaybackRate,
        ugcTrimRange: clampedUgcTrimRange,
      });

      await audioBufferSource.add(audioBuffer);
      endTimestamp = Math.max(endTimestamp, outputDuration);
      onProgress?.(0.95);
    } else if (audioSampleSource) {
      const ugcAudio = includeUgcAudio
        ? await copyAudioSamplesToSource({
            input: ugcInput,
            source: audioSampleSource,
            timelineOffset: 0,
            trimRange: clampedUgcTrimRange,
            onProgress: createMediaBunnyProgressMapper(
              onProgress,
              0.7,
              0.15,
            ),
          })
        : { endTimestamp: 0 };
      const demoAudio = includeDemoAudio
        ? await copyAudioSamplesToSource({
            input: demoInput,
            source: audioSampleSource,
            timelineOffset: demoTimelineOffset,
            trimRange: clampedDemoTrimRange,
            onProgress: createMediaBunnyProgressMapper(
              onProgress,
              0.85,
              0.1,
            ),
          })
        : { endTimestamp: demoTimelineOffset };
      endTimestamp = Math.max(
        endTimestamp,
        ugcAudio.endTimestamp,
        demoAudio.endTimestamp,
      );
    }

    const { blob, mimeType } = await finalizeMediaBunnyExportSession({
      onProgress,
      session,
    });

    return {
      blob,
      mimeType,
      duration: Math.max(endTimestamp, ugcDuration + demoDuration),
    };
  } finally {
    ugcInput.dispose();
    demoInput.dispose();
  }
}
