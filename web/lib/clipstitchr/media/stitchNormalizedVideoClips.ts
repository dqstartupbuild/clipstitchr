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
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

export type NormalizedVideoClipSegment = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

type StitchNormalizedVideoClipsResult = {
  blob: Blob;
  mimeType: string;
  duration: number;
};

type StitchNormalizedVideoClipsOptions = {
  onProgress?: (progress: number) => void;
};

export async function stitchNormalizedVideoClips(
  clips: NormalizedVideoClipSegment[],
  { onProgress }: StitchNormalizedVideoClipsOptions = {},
): Promise<StitchNormalizedVideoClipsResult> {
  if (!clips.length) {
    throw new Error("Add at least one clip before stitching.");
  }

  if (clips.length === 1) {
    return {
      blob: clips[0].blob,
      mimeType: clips[0].mimeType,
      duration: clips[0].duration,
    };
  }

  const inputs = clips.map((clip) => createMediaInput(clip.blob));

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
        `One generated clip has audio at ${unsupportedAudioParameters.numberOfChannels} channels and ` +
          `${unsupportedAudioParameters.sampleRate} Hz. Clipr needs normalized audio at ` +
          `${OUTPUT_AUDIO_NUMBER_OF_CHANNELS} channels and ${OUTPUT_AUDIO_SAMPLE_RATE} Hz before stitching.`,
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

    output.addVideoTrack(videoSource, {
      rotation: 0,
    });

    if (audioSource) {
      output.addAudioTrack(audioSource);
    }

    await output.start();

    let timelineOffset = 0;
    let endTimestamp = 0;
    const videoProgressShare = audioSource ? 0.7 : 0.95;

    for (let index = 0; index < clips.length; index += 1) {
      const clip = clips[index];
      const trimRange = { start: 0, end: clip.duration };
      const trimDuration = getVideoTrimRangeDuration(trimRange);
      const video = await copyVideoSamplesToSource({
        input: inputs[index],
        source: videoSource,
        timelineOffset,
        trimRange,
        onProgress: (progress) =>
          onProgress?.(((index + progress) / clips.length) * videoProgressShare),
      });

      timelineOffset = Math.max(timelineOffset + trimDuration, video.endTimestamp);
      endTimestamp = Math.max(endTimestamp, video.endTimestamp);
    }

    if (audioSource) {
      timelineOffset = 0;

      for (let index = 0; index < clips.length; index += 1) {
        const clip = clips[index];
        const trimRange = { start: 0, end: clip.duration };
        const trimDuration = getVideoTrimRangeDuration(trimRange);
        const audio = await copyAudioSamplesToSource({
          input: inputs[index],
          source: audioSource,
          timelineOffset,
          trimRange,
          onProgress: (progress) =>
            onProgress?.(0.7 + ((index + progress) / clips.length) * 0.25),
        });

        timelineOffset = Math.max(timelineOffset + trimDuration, audio.endTimestamp);
        endTimestamp = Math.max(endTimestamp, audio.endTimestamp);
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
      mimeType,
      duration: endTimestamp,
    };
  } finally {
    inputs.forEach((input) => input.dispose());
  }
}
