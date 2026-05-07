import {
  getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec,
  Mp4OutputFormat,
} from "mediabunny";
import {
  PREFERRED_AUDIO_CODECS,
  PREFERRED_VIDEO_CODECS,
} from "@/lib/clipr/constants/mediaBunnyCodecPreferences";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipr/constants/tiktokOutputSize";
import type { OutputCodecs } from "@/lib/clipr/types/OutputCodecs";

export async function getSupportedOutputCodecs(
  includeAudio: boolean,
): Promise<OutputCodecs> {
  const format = new Mp4OutputFormat();
  const supportedVideoCodecs = format.getSupportedVideoCodecs();
  const supportedAudioCodecs = format.getSupportedAudioCodecs();
  const videoPreferences = PREFERRED_VIDEO_CODECS.filter((codec) =>
    supportedVideoCodecs.includes(codec),
  );
  const audioPreferences = PREFERRED_AUDIO_CODECS.filter((codec) =>
    supportedAudioCodecs.includes(codec),
  );
  const videoCodec = await getFirstEncodableVideoCodec(videoPreferences, {
    width: TIKTOK_OUTPUT_WIDTH,
    height: TIKTOK_OUTPUT_HEIGHT,
    bitrate: 8_000_000,
  });
  const audioCodec = includeAudio
    ? await getFirstEncodableAudioCodec(audioPreferences, {
        bitrate: 160_000,
      })
    : null;
  const warnings: string[] = [];

  if (!videoCodec) {
    warnings.push("This browser cannot encode an MP4 video track for Clipr.");
  }

  if (includeAudio && !audioCodec) {
    warnings.push("This browser cannot encode an MP4 audio track for Clipr.");
  }

  return { videoCodec, audioCodec, warnings };
}
