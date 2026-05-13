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
import type { LongrSequenceClip } from "@/lib/clipstitchr/types/LongrSequenceClip";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type StitchLongrSequenceOptions = {
  onProgress?: (progress: number) => void;
};

type StitchLongrSequenceResult = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

export async function stitchLongrSequence(
  sequence: LongrSequenceClip[],
  { onProgress }: StitchLongrSequenceOptions = {},
): Promise<StitchLongrSequenceResult> {
  if (!sequence.length) {
    throw new Error("Select at least one clip before building a Longr video.");
  }

  const inputs = sequence.map(({ clip }) => createMediaInput(clip.blob));

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
        `One selected clip has audio at ${unsupportedAudioParameters.numberOfChannels} channels and ` +
          `${unsupportedAudioParameters.sampleRate} Hz. Re-upload it so ClipStitchr can normalize audio to ` +
          `${OUTPUT_AUDIO_NUMBER_OF_CHANNELS} channels at ${OUTPUT_AUDIO_SAMPLE_RATE} Hz before building Longr.`,
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
    const timelineOffsets = new Array<number>(sequence.length);
    const trimRanges = sequence.map(({ clip, trimRange }) =>
      clampVideoTrimRange(trimRange, clip.duration),
    );

    output.addVideoTrack(videoSource, {
      rotation: 0,
    });

    if (audioSource) {
      output.addAudioTrack(audioSource);
    }

    await output.start();

    let timelineOffset = 0;
    let endTimestamp = 0;

    for (let index = 0; index < sequence.length; index += 1) {
      const input = inputs[index];
      const trimRange = trimRanges[index];
      const trimDuration = getVideoTrimRangeDuration(trimRange);
      const segmentOffset = Math.max(timelineOffset, endTimestamp);
      const segmentVideo = await copyVideoSamplesToSource({
        input,
        source: videoSource,
        timelineOffset: segmentOffset,
        trimRange,
        onProgress: (progress) =>
          onProgress?.(((index + progress) / sequence.length) * 0.7),
      });

      timelineOffsets[index] = segmentOffset;
      endTimestamp = Math.max(endTimestamp, segmentVideo.endTimestamp);
      timelineOffset = segmentOffset + trimDuration;
    }

    if (audioSource) {
      for (let index = 0; index < sequence.length; index += 1) {
        const input = inputs[index];
        const trimRange = trimRanges[index];
        const segmentAudio = await copyAudioSamplesToSource({
          input,
          source: audioSource,
          timelineOffset: timelineOffsets[index] ?? 0,
          trimRange,
          onProgress: (progress) =>
            onProgress?.(0.7 + ((index + progress) / sequence.length) * 0.25),
        });

        endTimestamp = Math.max(endTimestamp, segmentAudio.endTimestamp);
      }
    }

    videoSource.close();
    audioSource?.close();

    await output.finalize();

    onProgress?.(1);

    const mimeType = await getVideoMimeType(output);
    const blob = createVideoBlobFromBuffer(output.target.buffer, mimeType);

    return {
      blob,
      duration: Math.max(endTimestamp, timelineOffset),
      mimeType,
    };
  } finally {
    inputs.forEach((input) => input.dispose());
  }
}
