import type { Input } from "mediabunny";
import { getClipMetadata } from "@/lib/clipstitchr/media/getClipMetadata";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";

export async function getLocalVideoInspection(
  input: Input,
  file: File,
): Promise<LocalVideoInspection> {
  const metadata = await getClipMetadata(input);
  const videoTrack = await input.getPrimaryVideoTrack();

  if (!videoTrack) {
    throw new Error("Choose a file that contains a video track.");
  }

  const audioTrack = await input.getPrimaryAudioTrack();
  const [
    videoCodec,
    videoCodecParameter,
    videoPacketStats,
    hasHighDynamicRange,
    pixelAspectRatio,
    videoTracks,
    audioTracks,
    audioCodec,
    audioCodecParameter,
    audioPacketStats,
    audioChannels,
    audioSampleRate,
  ] = await Promise.all([
    videoTrack.getCodec().catch(() => null),
    videoTrack.getCodecParameterString().catch(() => null),
    videoTrack.computePacketStats(120).catch(() => null),
    videoTrack.hasHighDynamicRange().catch(() => null),
    videoTrack.getPixelAspectRatio().catch(() => null),
    input.getVideoTracks().catch(() => [videoTrack]),
    input.getAudioTracks().catch(() => (audioTrack ? [audioTrack] : [])),
    audioTrack?.getCodec().catch(() => null) ?? Promise.resolve(null),
    audioTrack?.getCodecParameterString().catch(() => null) ??
      Promise.resolve(null),
    audioTrack?.computePacketStats(120).catch(() => null) ??
      Promise.resolve(null),
    audioTrack?.getNumberOfChannels().catch(() => null) ??
      Promise.resolve(null),
    audioTrack?.getSampleRate().catch(() => null) ?? Promise.resolve(null),
  ]);

  return {
    fileName: file.name,
    fileSize: file.size,
    duration: metadata.duration,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.aspectRatio,
    rotation: metadata.rotation,
    mimeType: metadata.mimeType,
    hasAudio: metadata.hasAudio,
    videoCanDecode: metadata.videoCanDecode,
    audioCanDecode: metadata.audioCanDecode,
    videoCodec,
    videoCodecParameter,
    videoFrameRate: videoPacketStats?.averagePacketRate ?? null,
    videoBitrate: videoPacketStats?.averageBitrate ?? null,
    hasHighDynamicRange,
    pixelAspectRatio,
    audioCodec,
    audioCodecParameter,
    audioBitrate: audioPacketStats?.averageBitrate ?? null,
    audioChannels,
    audioSampleRate,
    videoTrackCount: videoTracks.length,
    audioTrackCount: audioTracks.length,
  };
}
