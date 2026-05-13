import { AudioBufferSource, VideoSampleSource } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { copyVideoSamplesToSource } from "@/lib/clipstitchr/media/copyVideoSamplesToSource";
import { createLongrMixedAudioBuffer } from "@/lib/clipstitchr/media/createLongrMixedAudioBuffer";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createMp4Output } from "@/lib/clipstitchr/media/createMp4Output";
import { createVideoBlobFromBuffer } from "@/lib/clipstitchr/media/createVideoBlobFromBuffer";
import { getSupportedOutputCodecs } from "@/lib/clipstitchr/media/getSupportedOutputCodecs";
import { getVideoMimeType } from "@/lib/clipstitchr/media/getVideoMimeType";
import { registerAacEncoderIfNeeded } from "@/lib/clipstitchr/media/registerAacEncoderIfNeeded";
import type { LongrSequenceClip } from "@/lib/clipstitchr/types/LongrSequenceClip";
import type { LongrSequenceMusicClip } from "@/lib/clipstitchr/types/LongrSequenceMusicClip";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type StitchLongrSequenceOptions = {
  musicClips?: LongrSequenceMusicClip[];
  onProgress?: (progress: number) => void;
};

type StitchLongrSequenceResult = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

export async function stitchLongrSequence(
  sequence: LongrSequenceClip[],
  { musicClips = [], onProgress }: StitchLongrSequenceOptions = {},
): Promise<StitchLongrSequenceResult> {
  if (!sequence.length) {
    throw new Error("Select at least one clip before building a Long.");
  }

  const inputs = sequence.map(({ clip }) => createMediaInput(clip.blob));

  try {
    await registerAacEncoderIfNeeded();

    const audioTracks = await Promise.all(
      inputs.map((input) => input.getPrimaryAudioTrack()),
    );
    const includeAudio = audioTracks.some(Boolean) || musicClips.length > 0;

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
      ? new AudioBufferSource({
          codec: codecs.audioCodec ?? "aac",
          bitrate: 160_000,
          transform: {
            numberOfChannels: OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
            sampleRate: OUTPUT_AUDIO_SAMPLE_RATE,
          },
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
      const outputDuration = Math.max(endTimestamp, timelineOffset);
      const mixedAudioBuffer = await createLongrMixedAudioBuffer({
        inputs,
        musicClips,
        outputDuration,
        timelineOffsets,
        trimRanges,
      });

      await audioSource.add(mixedAudioBuffer);
      onProgress?.(0.95);
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
