import { Conversion } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createMp4Output } from "@/lib/clipstitchr/media/createMp4Output";
import { createVideoBlobFromBuffer } from "@/lib/clipstitchr/media/createVideoBlobFromBuffer";
import { getClipMetadata } from "@/lib/clipstitchr/media/getClipMetadata";
import { getSupportedOutputCodecs } from "@/lib/clipstitchr/media/getSupportedOutputCodecs";
import { getVideoMimeType } from "@/lib/clipstitchr/media/getVideoMimeType";
import { registerAacEncoderIfNeeded } from "@/lib/clipstitchr/media/registerAacEncoderIfNeeded";
import type { ClipMetadata } from "@/lib/clipstitchr/types/ClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";

type TrimNormalizedVideoResult = {
  blob: Blob;
  metadata: ClipMetadata;
  mimeType: string;
};

type TrimNormalizedVideoOptions = {
  blob: Blob;
  trimRange: VideoTrimRange;
  onProgress?: (progress: number) => void;
};

export async function trimNormalizedVideo({
  blob,
  trimRange,
  onProgress,
}: TrimNormalizedVideoOptions): Promise<TrimNormalizedVideoResult> {
  const input = createMediaInput(blob);

  try {
    const metadata = await getClipMetadata(input);
    const clampedTrimRange = clampVideoTrimRange(
      trimRange,
      metadata.duration,
    );

    if (!metadata.videoCanDecode) {
      throw new Error("This browser cannot decode the selected video segment.");
    }

    if (metadata.hasAudio && !metadata.audioCanDecode) {
      throw new Error("This browser cannot decode the selected segment audio.");
    }

    await registerAacEncoderIfNeeded();

    const codecs = await getSupportedOutputCodecs(metadata.hasAudio);

    if (!codecs.videoCodec) {
      throw new Error(codecs.warnings[0] ?? "No supported video encoder found.");
    }

    if (metadata.hasAudio && !codecs.audioCodec) {
      throw new Error(
        codecs.warnings[1] ?? "No supported audio encoder found for this segment.",
      );
    }

    const output = createMp4Output();
    const conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      trim: clampedTrimRange,
      video: {
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
        fit: "contain",
        allowRotationMetadata: false,
        forceTranscode: true,
        codec: codecs.videoCodec,
        bitrate: 8_000_000,
      },
      audio: metadata.hasAudio
        ? {
            numberOfChannels: OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
            sampleRate: OUTPUT_AUDIO_SAMPLE_RATE,
            codec: codecs.audioCodec ?? "aac",
            bitrate: 160_000,
            forceTranscode: true,
          }
        : {
            discard: true,
          },
      showWarnings: false,
    });

    if (!conversion.isValid) {
      throw new Error("Media Bunny could not initialize a valid segment trim.");
    }

    conversion.onProgress = (progress) => onProgress?.(progress);

    await conversion.execute();

    const mimeType = await getVideoMimeType(output);
    const trimmedBlob = createVideoBlobFromBuffer(output.target.buffer, mimeType);
    const trimmedInput = createMediaInput(trimmedBlob);

    try {
      const trimmedMetadata = await getClipMetadata(trimmedInput);

      return {
        blob: trimmedBlob,
        mimeType,
        metadata: {
          ...trimmedMetadata,
          width: TIKTOK_OUTPUT_WIDTH,
          height: TIKTOK_OUTPUT_HEIGHT,
          aspectRatio: TIKTOK_OUTPUT_WIDTH / TIKTOK_OUTPUT_HEIGHT,
          mimeType,
        },
      };
    } finally {
      trimmedInput.dispose();
    }
  } finally {
    input.dispose();
  }
}
