import type { Input, InputTrack } from "mediabunny";

export async function getInputDuration(input: Input) {
  const videoTrack = await input.getPrimaryVideoTrack();
  const audioTrack = await input.getPrimaryAudioTrack();
  const tracks: InputTrack[] = [];

  if (videoTrack) {
    tracks.push(videoTrack);
  }

  if (audioTrack) {
    tracks.push(audioTrack);
  }

  return input.computeDuration(tracks);
}
