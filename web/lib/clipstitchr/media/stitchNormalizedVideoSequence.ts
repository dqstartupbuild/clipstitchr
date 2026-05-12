import { AudioSampleSource, VideoSampleSource } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { copyAudioSamplesToSource } from "@/lib/clipstitchr/media/copyAudioSamplesToSource";
import { copyVideoSamplesToSource } from "@/lib/clipstitchr/media/copyVideoSamplesToSource";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createMp4Output } from "@/lib/clipstitchr/media/createMp4Output";
import { createVideoBlobFromBuffer } from "@/lib/clipstitchr/media/createVideoBlobFromBuffer";
import { getInputAudioParameters } from "@/lib/clipstitchr/media/getInputAudioParameters";
import { getSupportedOutputCodecs } from "@/lib/clipstitchr/media/getSupportedOutputCodecs";
import { getVideoMimeType } from "@/lib/clipstitchr/media/getVideoMimeType";
import { registerAacEncoderIfNeeded } from "@/lib/clipstitchr/media/registerAacEncoderIfNeeded";
import type { VideoSequenceClip } from "@/lib/clipstitchr/types/VideoSequenceClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type StitchNormalizedVideoSequenceOptions = {
  onProgress?: (progress: number) => void;
  targetDuration?: number;
};

type PlannedSegment = {
  index: number;
  timelineOffset: number;
  trimRange: VideoTrimRange;
};

export async function stitchNormalizedVideoSequence(
  segments: VideoSequenceClip[],
  { onProgress, targetDuration }: StitchNormalizedVideoSequenceOptions = {},
) {
  if (!segments.length) {
    throw new Error("Clipr needs at least one generated scene to stitch.");
  }

  const inputs = segments.map((segment) => createMediaInput(segment.clip.blob));

  try {
    await registerAacEncoderIfNeeded();

    const audioParameters = await Promise.all(
      inputs.map((input) => getInputAudioParameters(input)),
    );
    const includeAudio = audioParameters.some(Boolean);
    const unsupportedAudioParameters = audioParameters.find(
      (parameters) =>
        parameters &&
        (parameters.numberOfChannels !== OUTPUT_AUDIO_NUMBER_OF_CHANNELS ||
          parameters.sampleRate !== OUTPUT_AUDIO_SAMPLE_RATE),
    );

    if (unsupportedAudioParameters) {
      throw new Error(
        `One Clipr scene has audio at ${unsupportedAudioParameters.numberOfChannels} channels and ` +
          `${unsupportedAudioParameters.sampleRate} Hz. Clipr needs normalized audio at ` +
          `${OUTPUT_AUDIO_NUMBER_OF_CHANNELS} channels and ${OUTPUT_AUDIO_SAMPLE_RATE} Hz.`,
      );
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

    const plannedSegments: PlannedSegment[] = [];
    let timelineOffset = 0;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const remainingDuration =
        targetDuration === undefined ? Infinity : targetDuration - timelineOffset;

      if (remainingDuration <= 0) {
        break;
      }

      const clampedTrimRange = clampVideoTrimRange(
        segment.trimRange,
        segment.clip.duration,
      );
      const segmentDuration = getVideoTrimRangeDuration(clampedTrimRange);
      const trimRange =
        remainingDuration < segmentDuration
          ? {
              start: clampedTrimRange.start,
              end: clampedTrimRange.start + remainingDuration,
            }
          : clampedTrimRange;
      const trimDuration = getVideoTrimRangeDuration(trimRange);

      plannedSegments.push({
        index,
        timelineOffset,
        trimRange,
      });
      timelineOffset += trimDuration;
    }

    const output = createMp4Output();
    const videoSource = new VideoSampleSource({
      codec: codecs.videoCodec,
      bitrate: 8_000_000,
      keyFrameInterval: 2,
      sizeChangeBehavior: "contain",
      transform: {
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
      },
    });
    const audioSource = includeAudio
      ? new AudioSampleSource({
          codec: codecs.audioCodec ?? "aac",
          bitrate: 160_000,
        })
      : null;
    let endTimestamp = 0;

    output.addVideoTrack(videoSource, {
      rotation: 0,
    });

    if (audioSource) {
      output.addAudioTrack(audioSource);
    }

    await output.start();

    for (let index = 0; index < plannedSegments.length; index += 1) {
      const segment = plannedSegments[index];
      const video = await copyVideoSamplesToSource({
        input: inputs[segment.index],
        source: videoSource,
        timelineOffset: segment.timelineOffset,
        trimRange: segment.trimRange,
        onProgress: (progress) =>
          onProgress?.((index + progress * 0.65) / plannedSegments.length),
      });

      endTimestamp = Math.max(endTimestamp, video.endTimestamp);
    }

    if (audioSource) {
      for (let index = 0; index < plannedSegments.length; index += 1) {
        const segment = plannedSegments[index];
        const audio = await copyAudioSamplesToSource({
          input: inputs[segment.index],
          source: audioSource,
          timelineOffset: segment.timelineOffset,
          trimRange: segment.trimRange,
          onProgress: (progress) =>
            onProgress?.(
              (index + 0.65 + progress * 0.3) / plannedSegments.length,
            ),
        });

        endTimestamp = Math.max(endTimestamp, audio.endTimestamp);
      }
    }

    videoSource.close();
    audioSource?.close();

    await output.finalize();

    onProgress?.(1);

    const mimeType = await getVideoMimeType(output);

    return {
      blob: createVideoBlobFromBuffer(output.target.buffer, mimeType),
      duration: Math.max(endTimestamp, timelineOffset),
      hasAudio: includeAudio,
      mimeType,
    };
  } finally {
    for (const input of inputs) {
      input.dispose();
    }
  }
}
