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
import type { StitchSourceAudioOptions } from "@/lib/clipstitchr/types/StitchSourceAudioOptions";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getVideoTrimRangeDuration } from "@/lib/clipstitchr/utils/getVideoTrimRangeDuration";

type StitchNormalizedVideosResult = {
  blob: Blob;
  mimeType: string;
  duration: number;
};

type StitchNormalizedVideosOptions = {
  ugcTrimRange: VideoTrimRange;
  demoTrimRange: VideoTrimRange;
  onProgress?: (progress: number) => void;
} & StitchSourceAudioOptions;

export async function stitchNormalizedVideos(
  ugcClip: VideoClip,
  demoClip: VideoClip,
  {
    ugcTrimRange,
    demoTrimRange,
    includeDemoAudio = true,
    includeUgcAudio = true,
    onProgress,
  }: StitchNormalizedVideosOptions,
): Promise<StitchNormalizedVideosResult> {
  const ugcInput = createMediaInput(ugcClip.blob);
  const demoInput = createMediaInput(demoClip.blob);

  try {
    const [ugcAudioParameters, demoAudioParameters] = await Promise.all([
      includeUgcAudio ? getInputAudioParameters(ugcInput) : null,
      includeDemoAudio ? getInputAudioParameters(demoInput) : null,
    ]);
    const clampedUgcTrimRange = clampVideoTrimRange(
      ugcTrimRange,
      ugcClip.duration,
    );
    const clampedDemoTrimRange = clampVideoTrimRange(
      demoTrimRange,
      demoClip.duration,
    );
    const ugcDuration = getVideoTrimRangeDuration(clampedUgcTrimRange);
    const demoDuration = getVideoTrimRangeDuration(clampedDemoTrimRange);
    const includeAudio = Boolean(ugcAudioParameters || demoAudioParameters);

    assertNormalizedAudioParameters({
      audioParameters: ugcAudioParameters,
      subject: "One selected clip",
      workflow: "stitching",
    });
    assertNormalizedAudioParameters({
      audioParameters: demoAudioParameters,
      subject: "One selected clip",
      workflow: "stitching",
    });

    const codecs = await resolveMediaBunnyOutputCodecs(
      includeAudio,
      "No supported audio encoder found for this export.",
    );
    const session = await createMediaBunnyExportSession({
      audioSource: createOutputAudioSampleSource(
        includeAudio,
        codecs.audioCodec,
      ),
      videoSource: createTikTokVideoSampleSource(codecs.videoCodec),
    });

    const ugcVideo = await copyVideoSamplesToSource({
      input: ugcInput,
      source: session.videoSource,
      timelineOffset: 0,
      trimRange: clampedUgcTrimRange,
      onProgress: createMediaBunnyProgressMapper(onProgress, 0, 0.35),
    });
    const demoTimelineOffset = Math.max(ugcDuration, ugcVideo.endTimestamp);
    const demoVideo = await copyVideoSamplesToSource({
      input: demoInput,
      source: session.videoSource,
      timelineOffset: demoTimelineOffset,
      trimRange: clampedDemoTrimRange,
      onProgress: createMediaBunnyProgressMapper(onProgress, 0.35, 0.35),
    });
    let endTimestamp = Math.max(ugcVideo.endTimestamp, demoVideo.endTimestamp);

    if (session.audioSource) {
      const ugcAudio = includeUgcAudio
        ? await copyAudioSamplesToSource({
            input: ugcInput,
            source: session.audioSource,
            timelineOffset: 0,
            trimRange: clampedUgcTrimRange,
            onProgress: createMediaBunnyProgressMapper(
              onProgress,
              0.7,
              0.15,
            ),
          })
        : { endTimestamp: 0 };
      const demoAudio = includeDemoAudio
        ? await copyAudioSamplesToSource({
            input: demoInput,
            source: session.audioSource,
            timelineOffset: demoTimelineOffset,
            trimRange: clampedDemoTrimRange,
            onProgress: createMediaBunnyProgressMapper(
              onProgress,
              0.85,
              0.1,
            ),
          })
        : { endTimestamp: demoTimelineOffset };
      endTimestamp = Math.max(
        endTimestamp,
        ugcAudio.endTimestamp,
        demoAudio.endTimestamp,
      );
    }

    const { blob, mimeType } = await finalizeMediaBunnyExportSession({
      onProgress,
      session,
    });

    return {
      blob,
      mimeType,
      duration: Math.max(endTimestamp, ugcDuration + demoDuration),
    };
  } finally {
    ugcInput.dispose();
    demoInput.dispose();
  }
}
