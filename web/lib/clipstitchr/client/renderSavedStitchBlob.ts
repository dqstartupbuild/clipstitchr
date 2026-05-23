import { stitchNormalizedVideos } from "@/lib/clipstitchr/media/stitchNormalizedVideos";
import { stitchNormalizedVideosWithTextOverlay } from "@/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type RenderSavedStitchBlobOptions = {
  loadClip: (id: string) => Promise<VideoClip | null>;
  onProgress?: (progress: number) => void;
  stitch: Stitch;
};

export async function renderSavedStitchBlob({
  loadClip,
  onProgress,
  stitch,
}: RenderSavedStitchBlobOptions) {
  const [ugcClip, demoClip] = await Promise.all([
    loadClip(stitch.ugcClipId),
    loadClip(stitch.demoClipId),
  ]);

  if (!ugcClip || !demoClip) {
    throw new Error("Unable to load the source videos for this stitch.");
  }

  const ugcTrimRange = clampVideoTrimRange(
    stitch.ugcTrimRange ?? {
      start: 0,
      end: ugcClip.duration,
    },
    ugcClip.duration,
  );
  const demoTrimRange = clampVideoTrimRange(
    stitch.demoTrimRange ?? {
      start: 0,
      end: demoClip.duration,
    },
    demoClip.duration,
  );
  const ugcPlaybackRate = stitch.ugcPlaybackRate ?? 1;
  const demoPlaybackRate = stitch.demoPlaybackRate ?? 1;
  const totalDuration =
    getPlaybackRateDuration(ugcTrimRange, ugcPlaybackRate) +
    getPlaybackRateDuration(demoTrimRange, demoPlaybackRate);
  const textOverlay =
    stitch.textOverlay && stitch.textOverlay.text.trim().length > 0
      ? clampTextOverlay(stitch.textOverlay, totalDuration)
      : null;
  const options = {
    demoTrimRange,
    demoPlaybackRate,
    includeDemoAudio: stitch.includeDemoAudio,
    includeUgcAudio: stitch.includeUgcAudio,
    onProgress,
    ugcPlaybackRate,
    ugcTrimRange,
  };

  if (!textOverlay) {
    return (await stitchNormalizedVideos(ugcClip, demoClip, options)).blob;
  }

  return (
    await stitchNormalizedVideosWithTextOverlay(ugcClip, demoClip, {
      ...options,
      textOverlay,
    })
  ).blob;
}
