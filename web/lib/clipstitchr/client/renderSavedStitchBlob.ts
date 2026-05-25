import { stitchNormalizedVideos } from "@/lib/clipstitchr/media/stitchNormalizedVideos";
import { stitchNormalizedVideosWithTextOverlay } from "@/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay";
import { stitchStitchrSequence } from "@/lib/clipstitchr/media/stitchStitchrSequence";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchrSequenceClip } from "@/lib/clipstitchr/types/StitchrSequenceClip";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getOrderedStitchSequenceSegments } from "@/lib/clipstitchr/utils/getOrderedStitchSequenceSegments";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";
import { getStitchIsLongr } from "@/lib/clipstitchr/utils/getStitchIsLongr";

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
  if (getStitchIsLongr(stitch)) {
    const segments = getOrderedStitchSequenceSegments(stitch.sequenceSegments);
    const loadedClips = await Promise.all(
      segments.map(async (segment) => {
        const clip = await loadClip(segment.clipId);

        if (!clip) {
          throw new Error("Unable to load the source videos for this stitch.");
        }

        return clip;
      }),
    );
    const sequence: StitchrSequenceClip[] = segments.map((segment, index) => ({
      clip: loadedClips[index],
      includeAudio:
        segment.clipType === "demo"
          ? stitch.includeDemoAudio === true
          : stitch.includeUgcAudio === true,
      playbackRate: segment.playbackRate ?? 1,
      trimRange: clampVideoTrimRange(
        segment.trimRange,
        loadedClips[index].duration,
      ),
    }));
    const totalDuration = segments.reduce(
      (duration, segment) => duration + segment.duration,
      0,
    );
    const textOverlay =
      stitch.textOverlay && stitch.textOverlay.text.trim().length > 0
        ? clampTextOverlay(stitch.textOverlay, totalDuration)
        : null;

    return (
      await stitchStitchrSequence(sequence, {
        onProgress,
        textOverlay,
      })
    ).blob;
  }

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
