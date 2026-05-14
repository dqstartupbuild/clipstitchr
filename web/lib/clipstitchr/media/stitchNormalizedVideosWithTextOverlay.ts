import { AudioSampleSource, CanvasSource } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { copyAudioSamplesToSource } from "@/lib/clipstitchr/media/copyAudioSamplesToSource";
import { copyTextOverlayVideoFramesToSource } from "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createMp4Output } from "@/lib/clipstitchr/media/createMp4Output";
import { createTextOverlayRenderContext } from "@/lib/clipstitchr/media/createTextOverlayRenderContext";
import { createVideoBlobFromBuffer } from "@/lib/clipstitchr/media/createVideoBlobFromBuffer";
import { getInputAudioParameters } from "@/lib/clipstitchr/media/getInputAudioParameters";
import { getSupportedOutputCodecs } from "@/lib/clipstitchr/media/getSupportedOutputCodecs";
import { getVideoMimeType } from "@/lib/clipstitchr/media/getVideoMimeType";
import { registerAacEncoderIfNeeded } from "@/lib/clipstitchr/media/registerAacEncoderIfNeeded";
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
    const unsupportedAudioParameters = [
      ugcAudioParameters,
      demoAudioParameters,
    ].find(
      (parameters) =>
        parameters &&
        (parameters.numberOfChannels !== OUTPUT_AUDIO_NUMBER_OF_CHANNELS ||
          parameters.sampleRate !== OUTPUT_AUDIO_SAMPLE_RATE),
    );

    if (unsupportedAudioParameters) {
      throw new Error(
        `One selected clip has audio at ${unsupportedAudioParameters.numberOfChannels} channels and ` +
          `${unsupportedAudioParameters.sampleRate} Hz. Re-upload it so ClipStitchr can normalize audio to ` +
          `${OUTPUT_AUDIO_NUMBER_OF_CHANNELS} channels at ${OUTPUT_AUDIO_SAMPLE_RATE} Hz before stitching.`,
      );
    }

    if (includeAudio) {
      await registerAacEncoderIfNeeded();
    }

    const codecs = await getSupportedOutputCodecs(includeAudio);

    if (!codecs.videoCodec) {
      throw new Error(codecs.warnings[0] ?? "No supported video encoder found.");
    }

    if (includeAudio && !codecs.audioCodec) {
      throw new Error(
        codecs.warnings[1] ?? "No supported audio encoder found for this export.",
      );
    }

    const output = createMp4Output();
    const renderContext = createTextOverlayRenderContext(
      TIKTOK_OUTPUT_WIDTH,
      TIKTOK_OUTPUT_HEIGHT,
    );
    const videoSource = new CanvasSource(renderContext.canvas, {
      codec: codecs.videoCodec,
      bitrate: 8_000_000,
      keyFrameInterval: 2,
    });
    const audioSource = includeAudio
      ? new AudioSampleSource({
          codec: codecs.audioCodec ?? "aac",
          bitrate: 160_000,
        })
      : null;

    output.addVideoTrack(videoSource, {
      rotation: 0,
    });

    if (audioSource) {
      output.addAudioTrack(audioSource);
    }

    await output.start();

    const ugcVideo = await copyTextOverlayVideoFramesToSource({
      input: ugcInput,
      source: videoSource,
      renderContext,
      timelineOffset: 0,
      trimRange: clampedUgcTrimRange,
      textOverlay,
      onProgress: (progress) => onProgress?.(progress * 0.35),
    });
    const demoTimelineOffset = Math.max(ugcDuration, ugcVideo.endTimestamp);
    const demoVideo = await copyTextOverlayVideoFramesToSource({
      input: demoInput,
      source: videoSource,
      renderContext,
      timelineOffset: demoTimelineOffset,
      trimRange: clampedDemoTrimRange,
      textOverlay,
      onProgress: (progress) => onProgress?.(0.35 + progress * 0.35),
    });
    let endTimestamp = Math.max(ugcVideo.endTimestamp, demoVideo.endTimestamp);

    if (audioSource) {
      const ugcAudio = includeUgcAudio
        ? await copyAudioSamplesToSource({
            input: ugcInput,
            source: audioSource,
            timelineOffset: 0,
            trimRange: clampedUgcTrimRange,
            onProgress: (progress) => onProgress?.(0.7 + progress * 0.15),
          })
        : { endTimestamp: 0 };
      const demoAudio = includeDemoAudio
        ? await copyAudioSamplesToSource({
            input: demoInput,
            source: audioSource,
            timelineOffset: demoTimelineOffset,
            trimRange: clampedDemoTrimRange,
            onProgress: (progress) => onProgress?.(0.85 + progress * 0.1),
          })
        : { endTimestamp: demoTimelineOffset };
      endTimestamp = Math.max(
        endTimestamp,
        ugcAudio.endTimestamp,
        demoAudio.endTimestamp,
      );
    }

    videoSource.close();
    audioSource?.close();

    await output.finalize();

    onProgress?.(1);

    const mimeType = await getVideoMimeType(output);
    const blob = createVideoBlobFromBuffer(output.target.buffer, mimeType);

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
