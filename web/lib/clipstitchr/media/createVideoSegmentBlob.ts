import { assertNormalizedAudioParameters } from "@/lib/clipstitchr/media/assertNormalizedAudioParameters";
import { copyAudioSamplesToSource } from "@/lib/clipstitchr/media/copyAudioSamplesToSource";
import { copyVideoSamplesToSource } from "@/lib/clipstitchr/media/copyVideoSamplesToSource";
import { createMediaBunnyExportSession } from "@/lib/clipstitchr/media/createMediaBunnyExportSession";
import { createMediaBunnyProgressMapper } from "@/lib/clipstitchr/media/createMediaBunnyProgressMapper";
import { createMediaInput } from "@/lib/clipstitchr/media/createMediaInput";
import { createOutputAudioSampleSource } from "@/lib/clipstitchr/media/createOutputAudioSampleSource";
import { createTikTokVideoSampleSource } from "@/lib/clipstitchr/media/createTikTokVideoSampleSource";
import { finalizeMediaBunnyExportSession } from "@/lib/clipstitchr/media/finalizeMediaBunnyExportSession";
import { getInputAudioParameters } from "@/lib/clipstitchr/media/getInputAudioParameters";
import { resolveMediaBunnyOutputCodecs } from "@/lib/clipstitchr/media/resolveMediaBunnyOutputCodecs";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type CreateVideoSegmentBlobOptions = {
  onProgress?: (progress: number) => void;
  trimRange: VideoTrimRange;
};

type CreateVideoSegmentBlobResult = {
  blob: Blob;
  duration: number;
  mimeType: string;
};

export async function createVideoSegmentBlob(
  clip: VideoClip,
  { onProgress, trimRange }: CreateVideoSegmentBlobOptions,
): Promise<CreateVideoSegmentBlobResult> {
  const input = createMediaInput(clip.blob);

  try {
    const clampedTrimRange = clampVideoTrimRange(trimRange, clip.duration);
    const trimDuration = getVideoTrimRangeDuration(clampedTrimRange);
    const audioParameters = await getInputAudioParameters(input);
    const includeAudio = Boolean(audioParameters);

    assertNormalizedAudioParameters({
      audioParameters,
      subject: "The selected clip",
      workflow: "swapping",
    });

    const codecs = await resolveMediaBunnyOutputCodecs(
      includeAudio,
      "No supported audio encoder found for this segment.",
    );
    const session = await createMediaBunnyExportSession({
      audioSource: createOutputAudioSampleSource(
        includeAudio,
        codecs.audioCodec,
      ),
      videoSource: createTikTokVideoSampleSource(codecs.videoCodec),
    });

    const video = await copyVideoSamplesToSource({
      input,
      source: session.videoSource,
      timelineOffset: 0,
      trimRange: clampedTrimRange,
      onProgress: createMediaBunnyProgressMapper(onProgress, 0, 0.7),
    });
    const audio = session.audioSource
      ? await copyAudioSamplesToSource({
          input,
          source: session.audioSource,
          timelineOffset: 0,
          trimRange: clampedTrimRange,
          onProgress: createMediaBunnyProgressMapper(onProgress, 0.7, 0.25),
        })
      : { endTimestamp: 0 };
    const { blob, mimeType } = await finalizeMediaBunnyExportSession({
      onProgress,
      session,
    });

    return {
      blob,
      duration: Math.max(video.endTimestamp, audio.endTimestamp, trimDuration),
      mimeType,
    };
  } finally {
    input.dispose();
  }
}
