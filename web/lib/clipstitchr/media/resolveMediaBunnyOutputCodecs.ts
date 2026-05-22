import type { AudioCodec, VideoCodec } from "mediabunny";
import { getSupportedOutputCodecs } from "@/lib/clipstitchr/media/getSupportedOutputCodecs";
import { registerAacEncoderIfNeeded } from "@/lib/clipstitchr/media/registerAacEncoderIfNeeded";

type ResolvedMediaBunnyOutputCodecs = {
  audioCodec: AudioCodec | null;
  videoCodec: VideoCodec;
};

export async function resolveMediaBunnyOutputCodecs(
  includeAudio: boolean,
  audioErrorFallback: string,
): Promise<ResolvedMediaBunnyOutputCodecs> {
  if (includeAudio) {
    await registerAacEncoderIfNeeded();
  }

  const codecs = await getSupportedOutputCodecs(includeAudio);

  if (!codecs.videoCodec) {
    throw new Error(codecs.warnings[0] ?? "No supported video encoder found.");
  }

  if (includeAudio && !codecs.audioCodec) {
    throw new Error(codecs.warnings[1] ?? audioErrorFallback);
  }

  return {
    audioCodec: codecs.audioCodec,
    videoCodec: codecs.videoCodec,
  };
}
