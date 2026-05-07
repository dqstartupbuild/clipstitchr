import { Conversion } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipr/constants/audioOutputParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipr/constants/tiktokOutputSize";
import { createMediaInput } from "@/lib/clipr/media/createMediaInput";
import { createMp4Output } from "@/lib/clipr/media/createMp4Output";
import { createVideoBlobFromBuffer } from "@/lib/clipr/media/createVideoBlobFromBuffer";
import { getClipMetadata } from "@/lib/clipr/media/getClipMetadata";
import { getSupportedOutputCodecs } from "@/lib/clipr/media/getSupportedOutputCodecs";
import { getVideoMimeType } from "@/lib/clipr/media/getVideoMimeType";
import { registerAacEncoderIfNeeded } from "@/lib/clipr/media/registerAacEncoderIfNeeded";
import type { ClipMetadata } from "@/lib/clipr/types/ClipMetadata";

type NormalizeUploadedVideoResult = {
  blob: Blob;
  metadata: ClipMetadata;
  mimeType: string;
};

type NormalizeUploadedVideoOptions = {
  fit?: "contain" | "cover";
};

export async function normalizeUploadedVideo(
  file: File,
  onProgress?: (progress: number) => void,
  options: NormalizeUploadedVideoOptions = {},
): Promise<NormalizeUploadedVideoResult> {
  const input = createMediaInput(file);

  try {
    const metadata = await getClipMetadata(input);

    if (!metadata.videoCanDecode) {
      throw new Error("This browser cannot decode the selected video track.");
    }

    if (metadata.hasAudio && !metadata.audioCanDecode) {
      throw new Error("This browser cannot decode the selected audio track.");
    }

    await registerAacEncoderIfNeeded();

    const codecs = await getSupportedOutputCodecs(metadata.hasAudio);

    if (!codecs.videoCodec) {
      throw new Error(codecs.warnings[0] ?? "No supported video encoder found.");
    }

    if (metadata.hasAudio && !codecs.audioCodec) {
      throw new Error(
        codecs.warnings[1] ?? "No supported audio encoder found for this upload.",
      );
    }

    const output = createMp4Output();
    const conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      video: {
        width: TIKTOK_OUTPUT_WIDTH,
        height: TIKTOK_OUTPUT_HEIGHT,
        fit: options.fit ?? "contain",
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
      throw new Error("Media Bunny could not initialize a valid conversion.");
    }

    conversion.onProgress = (progress) => onProgress?.(progress);

    await conversion.execute();

    const mimeType = await getVideoMimeType(output);
    const blob = createVideoBlobFromBuffer(output.target.buffer, mimeType);
    const normalizedInput = createMediaInput(blob);

    try {
      const normalizedMetadata = await getClipMetadata(normalizedInput);

      return {
        blob,
        mimeType,
        metadata: {
          ...normalizedMetadata,
          width: TIKTOK_OUTPUT_WIDTH,
          height: TIKTOK_OUTPUT_HEIGHT,
          aspectRatio: TIKTOK_OUTPUT_WIDTH / TIKTOK_OUTPUT_HEIGHT,
          mimeType,
        },
      };
    } finally {
      normalizedInput.dispose();
    }
  } finally {
    input.dispose();
  }
}
