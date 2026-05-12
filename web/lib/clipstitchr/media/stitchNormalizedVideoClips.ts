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

type StitchNormalizedVideoClipsResult = {
  blob: Blob;
  duration: number;
  hasAudio: boolean;
  mimeType: string;
};

type StitchNormalizedVideoClip = {
  blob: Blob;
  duration: number;
};

export async function stitchNormalizedVideoClips(
  clips: StitchNormalizedVideoClip[],
  onProgress?: (progress: number) => void,
): Promise<StitchNormalizedVideoClipsResult> {
  if (clips.length === 0) {
    throw new Error("Choose at least one generated Swapr segment to stitch.");
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
        `One generated segment has audio at ${unsupportedAudioParameters.numberOfChannels} channels and ` +
          `${unsupportedAudioParameters.sampleRate} Hz. Normalize the segment before stitching.`,
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

    for (const [index, input] of inputs.entries()) {
      const segmentProgressStart = index / clips.length;
      const segmentProgressSpan = 1 / clips.length;
      const trimRange = {
        start: 0,
        end: clips[index].duration,
      };
      const video = await copyVideoSamplesToSource({
        input,
        source: videoSource,
        timelineOffset,
        trimRange,
        onProgress: (progress) =>
          onProgress?.(
            segmentProgressStart +
              progress * segmentProgressSpan * (audioSource ? 0.7 : 1),
          ),
      });
      let segmentEndTimestamp = video.endTimestamp;

      if (audioSource) {
        const audio = await copyAudioSamplesToSource({
          input,
          source: audioSource,
          timelineOffset,
          trimRange,
          onProgress: (progress) =>
            onProgress?.(
              segmentProgressStart +
                segmentProgressSpan * 0.7 +
                progress * segmentProgressSpan * 0.3,
            ),
        });
        segmentEndTimestamp = Math.max(
          segmentEndTimestamp,
          audio.endTimestamp,
        );
      }

      timelineOffset = Math.max(
        timelineOffset + clips[index].duration,
        segmentEndTimestamp,
      );
      endTimestamp = Math.max(endTimestamp, segmentEndTimestamp);
    }

    videoSource.close();
    audioSource?.close();

    await output.finalize();

    onProgress?.(1);

    const mimeType = await getVideoMimeType(output);
    const blob = createVideoBlobFromBuffer(output.target.buffer, mimeType);

    return {
      blob,
      duration: Math.max(
        endTimestamp,
        clips.reduce((totalDuration, clip) => totalDuration + clip.duration, 0),
      ),
      hasAudio: includeAudio,
      mimeType,
    };
  } finally {
    for (const input of inputs) {
      input.dispose();
    }
  }
}
