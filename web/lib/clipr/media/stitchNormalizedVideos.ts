import { AudioSampleSource, VideoSampleSource } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipr/constants/audioOutputParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipr/constants/tiktokOutputSize";
import { copyAudioSamplesToSource } from "@/lib/clipr/media/copyAudioSamplesToSource";
import { copyVideoSamplesToSource } from "@/lib/clipr/media/copyVideoSamplesToSource";
import { createMediaInput } from "@/lib/clipr/media/createMediaInput";
import { createMp4Output } from "@/lib/clipr/media/createMp4Output";
import { createVideoBlobFromBuffer } from "@/lib/clipr/media/createVideoBlobFromBuffer";
import { getInputAudioParameters } from "@/lib/clipr/media/getInputAudioParameters";
import { getInputDuration } from "@/lib/clipr/media/getInputDuration";
import { getSupportedOutputCodecs } from "@/lib/clipr/media/getSupportedOutputCodecs";
import { getVideoMimeType } from "@/lib/clipr/media/getVideoMimeType";
import { registerAacEncoderIfNeeded } from "@/lib/clipr/media/registerAacEncoderIfNeeded";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type StitchNormalizedVideosResult = {
  blob: Blob;
  mimeType: string;
  duration: number;
};

export async function stitchNormalizedVideos(
  ugcClip: VideoClip,
  demoClip: VideoClip,
  onProgress?: (progress: number) => void,
): Promise<StitchNormalizedVideosResult> {
  const ugcInput = createMediaInput(ugcClip.blob);
  const demoInput = createMediaInput(demoClip.blob);

  try {
    await registerAacEncoderIfNeeded();

    const [ugcAudioParameters, demoAudioParameters, ugcDuration] =
      await Promise.all([
        getInputAudioParameters(ugcInput),
        getInputAudioParameters(demoInput),
        getInputDuration(ugcInput),
      ]);
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
          `${unsupportedAudioParameters.sampleRate} Hz. Re-upload it so Clipr can normalize audio to ` +
          `${OUTPUT_AUDIO_NUMBER_OF_CHANNELS} channels at ${OUTPUT_AUDIO_SAMPLE_RATE} Hz before stitching.`,
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

    const ugcVideo = await copyVideoSamplesToSource({
      input: ugcInput,
      source: videoSource,
      timelineOffset: 0,
      onProgress: (progress) => onProgress?.(progress * 0.35),
    });
    const demoTimelineOffset = Math.max(ugcDuration, ugcVideo.endTimestamp);
    const demoVideo = await copyVideoSamplesToSource({
      input: demoInput,
      source: videoSource,
      timelineOffset: demoTimelineOffset,
      onProgress: (progress) => onProgress?.(0.35 + progress * 0.35),
    });
    let endTimestamp = Math.max(ugcVideo.endTimestamp, demoVideo.endTimestamp);

    if (audioSource) {
      const ugcAudio = await copyAudioSamplesToSource({
        input: ugcInput,
        source: audioSource,
        timelineOffset: 0,
        onProgress: (progress) => onProgress?.(0.7 + progress * 0.15),
      });
      const demoAudio = await copyAudioSamplesToSource({
        input: demoInput,
        source: audioSource,
        timelineOffset: demoTimelineOffset,
        onProgress: (progress) => onProgress?.(0.85 + progress * 0.1),
      });
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
      duration: endTimestamp,
    };
  } finally {
    ugcInput.dispose();
    demoInput.dispose();
  }
}
