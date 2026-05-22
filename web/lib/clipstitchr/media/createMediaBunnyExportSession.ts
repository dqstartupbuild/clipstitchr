import type { AudioSampleSource, VideoSource } from "mediabunny";
import { createMp4Output } from "@/lib/clipstitchr/media/createMp4Output";
import type { MediaBunnyExportSession } from "@/lib/clipstitchr/types/MediaBunnyExportSession";

type CreateMediaBunnyExportSessionOptions<
  VideoSourceType extends VideoSource,
> = {
  audioSource: AudioSampleSource | null;
  videoSource: VideoSourceType;
};

export async function createMediaBunnyExportSession<
  VideoSourceType extends VideoSource,
>({
  audioSource,
  videoSource,
}: CreateMediaBunnyExportSessionOptions<VideoSourceType>): Promise<
  MediaBunnyExportSession<VideoSourceType>
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
