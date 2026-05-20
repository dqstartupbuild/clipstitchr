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
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type CreateVideoSegmentBlobOptions = {
  onProgress?: (progress: number) => void;
  trimRange: VideoTrimRange;
};

type CreateVideoSegmentBlobResult = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

export async function createVideoSegmentBlob(
  clip: VideoClip,
  { onProgress, trimRange }: CreateVideoSegmentBlobOptions,
): Promise<CreateVideoSegmentBlobResult> {
  const input = createMediaInput(clip.blob);

  try {
    const clampedTrimRange = clampVideoTrimRange(trimRange, clip.duration);
    const trimDuration = getVideoTrimRangeDuration(clampedTrimRange);
    const audioParameters = await getInputAudioParameters(input);
    const includeAudio = Boolean(audioParameters);

    if (
      audioParameters &&
      (audioParameters.numberOfChannels !== OUTPUT_AUDIO_NUMBER_OF_CHANNELS ||
        audioParameters.sampleRate !== OUTPUT_AUDIO_SAMPLE_RATE)
    ) {
      throw new Error(
        `The selected clip has audio at ${audioParameters.numberOfChannels} channels and ` +
          `${audioParameters.sampleRate} Hz. Re-upload it so ClipStitchr can normalize audio to ` +
          `${OUTPUT_AUDIO_NUMBER_OF_CHANNELS} channels at ${OUTPUT_AUDIO_SAMPLE_RATE} Hz before swapping.`,
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
        codecs.warnings[1] ?? "No supported audio encoder found for this segment.",
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

    const video = await copyVideoSamplesToSource({
      input,
      source: videoSource,
      timelineOffset: 0,
      trimRange: clampedTrimRange,
      onProgress: (progress) => onProgress?.(progress * 0.7),
    });
    const audio = audioSource
      ? await copyAudioSamplesToSource({
          input,
          source: audioSource,
          timelineOffset: 0,
          trimRange: clampedTrimRange,
          onProgress: (progress) => onProgress?.(0.7 + progress * 0.25),
        })
      : { endTimestamp: 0 };

    videoSource.close();
    audioSource?.close();

    await output.finalize();
    onProgress?.(1);

    const mimeType = await getVideoMimeType(output);
    const blob = createVideoBlobFromBuffer(output.target.buffer, mimeType);

    return {
      blob,
      duration: Math.max(video.endTimestamp, audio.endTimestamp, trimDuration),
      mimeType,
    };
  } finally {
    input.dispose();
  }
}
