import { assertNormalizedAudioParameters } from "@/lib/clipstitchr/media/assertNormalizedAudioParameters";
import type { CanvasSource, VideoSampleSource } from "mediabunny";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { copyTextOverlayVideoFramesToSource } from "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource";
import { copyVideoSamplesToSource } from "@/lib/clipstitchr/media/copyVideoSamplesToSource";
import { createMediaBunnyExportSession } from "@/lib/clipstitchr/media/createMediaBunnyExportSession";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createOutputAudioBufferSource } from "@/lib/clipstitchr/media/createOutputAudioBufferSource";
import { createStitchrSequenceAudioBuffer } from "@/lib/clipstitchr/media/createStitchrSequenceAudioBuffer";
import { createTextOverlayRenderContext } from "@/lib/clipstitchr/media/createTextOverlayRenderContext";
import { createTikTokCanvasSource } from "@/lib/clipstitchr/media/createTikTokCanvasSource";
import { createTikTokVideoSampleSource } from "@/lib/clipstitchr/media/createTikTokVideoSampleSource";
import { finalizeMediaBunnyExportSession } from "@/lib/clipstitchr/media/finalizeMediaBunnyExportSession";
import { getInputAudioParameters } from "@/lib/clipstitchr/media/getInputAudioParameters";
import { resolveMediaBunnyOutputCodecs } from "@/lib/clipstitchr/media/resolveMediaBunnyOutputCodecs";
import type { StitchrSequenceClip } from "@/lib/clipstitchr/types/StitchrSequenceClip";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type StitchStitchrSequenceOptions = {
  onProgress?: (progress: number) => void;
  textOverlay?: TextOverlay | null;
};

type StitchStitchrSequenceResult = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

export async function stitchStitchrSequence(
  sequence: StitchrSequenceClip[],
  { onProgress, textOverlay = null }: StitchStitchrSequenceOptions = {},
): Promise<StitchStitchrSequenceResult> {
  if (!sequence.length) {
    throw new Error("Select at least one source clip before stitching.");
  }

  const inputs = sequence.map(({ clip }) => createMediaInput(clip.blob));

  try {
    const audioParameters = await Promise.all(
      inputs.map((input, index) =>
        sequence[index]?.includeAudio ? getInputAudioParameters(input) : null,
      ),
    );
    const includeAudio = audioParameters.some(Boolean);
    const trimRanges = sequence.map(({ clip, trimRange }) =>
      clampVideoTrimRange(trimRange, clip.duration),
    );
    const playbackRates = sequence.map(
      ({ playbackRate }) => playbackRate ?? 1,
    );

    audioParameters.forEach((parameters) => {
      assertNormalizedAudioParameters({
        audioParameters: parameters,
        subject: "One selected clip",
        workflow: "stitching",
      });
    });

    const codecs = await resolveMediaBunnyOutputCodecs(
      includeAudio,
      "No supported audio encoder found for this export.",
    );
    const renderContext = textOverlay
      ? createTextOverlayRenderContext(TIKTOK_OUTPUT_WIDTH, TIKTOK_OUTPUT_HEIGHT)
      : null;
    const audioSource = createOutputAudioBufferSource(
      includeAudio,
      codecs.audioCodec,
    );
    const session = await createMediaBunnyExportSession({
      audioSource,
      videoSource: renderContext
        ? createTikTokCanvasSource(renderContext.canvas, codecs.videoCodec)
        : createTikTokVideoSampleSource(codecs.videoCodec),
    });
    const timelineOffsets = new Array<number>(sequence.length);
    let timelineOffset = 0;
    let endTimestamp = 0;

    for (let index = 0; index < sequence.length; index += 1) {
      const input = inputs[index];
      const trimRange = trimRanges[index];
      const playbackRate = playbackRates[index] ?? 1;
      const trimDuration = getPlaybackRateDuration(trimRange, playbackRate);
      const segmentOffset = Math.max(timelineOffset, endTimestamp);
      const progressStart = (index / sequence.length) * 0.7;
      const progressSpan = 0.7 / sequence.length;
      const segmentVideo =
        renderContext && textOverlay
          ? await copyTextOverlayVideoFramesToSource({
              input,
              playbackRate,
              renderContext,
              source: session.videoSource as CanvasSource,
              textOverlay,
              timelineOffset: segmentOffset,
              trimRange,
              onProgress: (progress) =>
                onProgress?.(progressStart + progress * progressSpan),
            })
          : await copyVideoSamplesToSource({
              input,
              playbackRate,
              source: session.videoSource as VideoSampleSource,
              timelineOffset: segmentOffset,
              trimRange,
              onProgress: (progress) =>
                onProgress?.(progressStart + progress * progressSpan),
            });

      timelineOffsets[index] = segmentOffset;
      endTimestamp = Math.max(endTimestamp, segmentVideo.endTimestamp);
      timelineOffset = segmentOffset + trimDuration;
    }

    if (audioSource) {
      const outputDuration = Math.max(endTimestamp, timelineOffset);
      const audioBuffer = await createStitchrSequenceAudioBuffer({
        includeAudioFlags: sequence.map((clip) => clip.includeAudio),
        inputs,
        outputDuration,
        playbackRates,
        timelineOffsets,
        trimRanges,
      });

      await audioSource.add(audioBuffer);
      endTimestamp = Math.max(endTimestamp, outputDuration);
      onProgress?.(0.95);
    }

    const { blob, mimeType } = await finalizeMediaBunnyExportSession({
      onProgress,
      session,
    });

    return {
      blob,
      duration: Math.max(endTimestamp, timelineOffset),
      mimeType,
    };
  } finally {
    inputs.forEach((input) => input.dispose());
  }
}
