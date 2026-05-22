import { assertNormalizedAudioParameters } from "@/lib/clipstitchr/media/assertNormalizedAudioParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { copyAudioSamplesToSource } from "@/lib/clipstitchr/media/copyAudioSamplesToSource";
import { copyTextOverlayVideoFramesToSource } from "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource";
import { createMediaBunnyExportSession } from "@/lib/clipstitchr/media/createMediaBunnyExportSession";
import { createMediaBunnyProgressMapper } from "@/lib/clipstitchr/media/createMediaBunnyProgressMapper";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createOutputAudioSampleSource } from "@/lib/clipstitchr/media/createOutputAudioSampleSource";
import { createTextOverlayRenderContext } from "@/lib/clipstitchr/media/createTextOverlayRenderContext";
import { createTikTokCanvasSource } from "@/lib/clipstitchr/media/createTikTokCanvasSource";
import { finalizeMediaBunnyExportSession } from "@/lib/clipstitchr/media/finalizeMediaBunnyExportSession";
import { getInputAudioParameters } from "@/lib/clipstitchr/media/getInputAudioParameters";
import { resolveMediaBunnyOutputCodecs } from "@/lib/clipstitchr/media/resolveMediaBunnyOutputCodecs";
import type { StitchSourceAudioOptions } from "@/lib/clipstitchr/types/StitchSourceAudioOptions";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type StitchNormalizedVideosWithTextOverlayResult = {
  blob: Blob;
  mimeType: string;
  duration: number;
};

type StitchNormalizedVideosWithTextOverlayOptions = {
  ugcTrimRange: VideoTrimRange;
  demoTrimRange: VideoTrimRange;
  textOverlay: TextOverlay;
  onProgress?: (progress: number) => void;
} & StitchSourceAudioOptions;

export async function stitchNormalizedVideosWithTextOverlay(
  ugcClip: VideoClip,
  demoClip: VideoClip,
  {
    ugcTrimRange,
    demoTrimRange,
    includeDemoAudio = true,
    includeUgcAudio = true,
    textOverlay,
    onProgress,
  }: StitchNormalizedVideosWithTextOverlayOptions,
): Promise<StitchNormalizedVideosWithTextOverlayResult> {
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
    const ugcDuration = getVideoTrimRangeDuration(clampedUgcTrimRange);
    const demoDuration = getVideoTrimRangeDuration(clampedDemoTrimRange);
    const includeAudio = Boolean(ugcAudioParameters || demoAudioParameters);

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
    const renderContext = createTextOverlayRenderContext(
      TIKTOK_OUTPUT_WIDTH,
      TIKTOK_OUTPUT_HEIGHT,
    );
    const session = await createMediaBunnyExportSession({
      audioSource: createOutputAudioSampleSource(
        includeAudio,
        codecs.audioCodec,
      ),
      videoSource: createTikTokCanvasSource(
        renderContext.canvas,
        codecs.videoCodec,
      ),
    });

    const ugcVideo = await copyTextOverlayVideoFramesToSource({
      input: ugcInput,
      source: session.videoSource,
      renderContext,
      timelineOffset: 0,
      trimRange: clampedUgcTrimRange,
      textOverlay,
      onProgress: createMediaBunnyProgressMapper(onProgress, 0, 0.35),
    });
    const demoTimelineOffset = Math.max(ugcDuration, ugcVideo.endTimestamp);
    const demoVideo = await copyTextOverlayVideoFramesToSource({
      input: demoInput,
      source: session.videoSource,
      renderContext,
      timelineOffset: demoTimelineOffset,
      trimRange: clampedDemoTrimRange,
      textOverlay,
      onProgress: createMediaBunnyProgressMapper(onProgress, 0.35, 0.35),
    });
    let endTimestamp = Math.max(ugcVideo.endTimestamp, demoVideo.endTimestamp);

    if (session.audioSource) {
      const ugcAudio = includeUgcAudio
        ? await copyAudioSamplesToSource({
            input: ugcInput,
            source: session.audioSource,
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
            source: session.audioSource,
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
