import {
  getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec,
  Mp4OutputFormat,
} from "mediabunny";
import {
  PREFERRED_AUDIO_CODECS,
  PREFERRED_VIDEO_CODECS,
} from "@/lib/clipstitchr/constants/mediaBunnyCodecPreferences";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import type { OutputCodecs } from "@/lib/clipstitchr/types/OutputCodecs";

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
        numberOfChannels: OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
        sampleRate: OUTPUT_AUDIO_SAMPLE_RATE,
        bitrate: 160_000,
      })
    : null;
  const warnings: string[] = [];

  if (!videoCodec) {
    warnings.push(
      "This browser cannot create ClipStitchr videos. Try a modern desktop browser.",
    );
  }

  if (includeAudio && !audioCodec) {
    warnings.push(
      "This browser cannot keep audio in ClipStitchr videos. Try a modern desktop browser.",
    );
  }

  return { videoCodec, audioCodec, warnings };
}
