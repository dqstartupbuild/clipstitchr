import type { AudioSource, VideoSource } from "mediabunny";
import { createMp4Output } from "@/lib/clipstitchr/media/createMp4Output";
import type { MediaBunnyExportSession } from "@/lib/clipstitchr/types/MediaBunnyExportSession";

type CreateMediaBunnyExportSessionOptions<
  VideoSourceType extends VideoSource,
  AudioSourceType extends AudioSource | null,
> = {
  audioSource: AudioSourceType;
  videoSource: VideoSourceType;
};

export async function createMediaBunnyExportSession<
  VideoSourceType extends VideoSource,
  AudioSourceType extends AudioSource | null,
>({
  audioSource,
  videoSource,
}: CreateMediaBunnyExportSessionOptions<
  VideoSourceType,
  AudioSourceType
>): Promise<
  MediaBunnyExportSession<VideoSourceType, AudioSourceType>
> {
  const output = createMp4Output();

  output.addVideoTrack(videoSource, {
    rotation: 0,
  });

  if (audioSource) {
    output.addAudioTrack(audioSource);
  }

  await output.start();

  return { audioSource, output, videoSource };
}
