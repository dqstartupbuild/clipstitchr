import type { Input } from "mediabunny";
import type { ClipMetadata } from "@/lib/clipr/types/ClipMetadata";

export async function getClipMetadata(input: Input): Promise<ClipMetadata> {
  const canRead = await input.canRead();

  if (!canRead) {
    throw new Error("This file could not be read as a supported media file.");
  }

  const videoTrack = await input.getPrimaryVideoTrack();

  if (!videoTrack) {
    throw new Error("Clipr needs a video track to normalize this upload.");
  }

  const audioTrack = await input.getPrimaryAudioTrack();
  const width = await videoTrack.getDisplayWidth();
  const height = await videoTrack.getDisplayHeight();
  const rotation = await videoTrack.getRotation();
  const duration = await input.computeDuration(
    audioTrack ? [videoTrack, audioTrack] : [videoTrack],
  );
  const videoCanDecode = await videoTrack.canDecode();
  const audioCanDecode = audioTrack ? await audioTrack.canDecode() : true;
  const mimeType = await input.getMimeType();

  return {
    duration,
    width,
    height,
    aspectRatio: width / height,
    rotation,
    hasAudio: Boolean(audioTrack),
    videoCanDecode,
    audioCanDecode,
    mimeType,
  };
}
