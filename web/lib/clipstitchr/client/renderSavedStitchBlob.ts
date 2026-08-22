import { stitchNormalizedVideos } from "@/lib/clipstitchr/media/stitchNormalizedVideos";
import { stitchNormalizedVideosWithTextOverlay } from "@/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay";
import { stitchStitchrSequence } from "@/lib/clipstitchr/media/stitchStitchrSequence";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchrSequenceClip } from "@/lib/clipstitchr/types/StitchrSequenceClip";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getOrderedStitchSequenceSegments } from "@/lib/clipstitchr/utils/getOrderedStitchSequenceSegments";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getStitchHasSequenceSegments } from "@/lib/clipstitchr/utils/getStitchHasSequenceSegments";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";

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
  if (getStitchHasSequenceSegments(stitch)) {
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
      quickEdit: segment.quickEdit,
      trimRange: clampVideoTrimRange(
        segment.trimRange,
        loadedClips[index].duration,
      ),
    }));
    const totalDuration = segments.reduce(
      (duration, segment) => duration + segment.duration,
      0,
    );
    const textOverlays = getNonEmptyTextOverlays(
      clampTextOverlays(
        getTextOverlayList(stitch.textOverlays, stitch.textOverlay),
        totalDuration,
      ),
    );

    return (
      await stitchStitchrSequence(sequence, {
        onProgress,
        textOverlays,
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
    getQuickEditPlaybackDuration(
      ugcTrimRange,
      ugcClip.duration,
      stitch.ugcQuickEdit?.removeRanges,
      ugcPlaybackRate,
    ) +
    getQuickEditPlaybackDuration(
      demoTrimRange,
      demoClip.duration,
      stitch.demoQuickEdit?.removeRanges,
      demoPlaybackRate,
    );
  const textOverlays = getNonEmptyTextOverlays(
    clampTextOverlays(
      getTextOverlayList(stitch.textOverlays, stitch.textOverlay),
      totalDuration,
    ),
  );
  const options = {
    demoTrimRange,
    demoPlaybackRate,
    demoQuickEdit: stitch.demoQuickEdit,
    includeDemoAudio: stitch.includeDemoAudio,
    includeUgcAudio: stitch.includeUgcAudio,
    onProgress,
    ugcQuickEdit: stitch.ugcQuickEdit,
    ugcPlaybackRate,
    ugcTrimRange,
  };

  if (!textOverlays.length) {
    return (await stitchNormalizedVideos(ugcClip, demoClip, options)).blob;
  }

  return (
    await stitchNormalizedVideosWithTextOverlay(ugcClip, demoClip, {
      ...options,
      textOverlays,
    })
  ).blob;
}
