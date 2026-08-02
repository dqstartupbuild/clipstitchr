import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import { renderSwiprSlideBlob } from "@/lib/clipstitchr/media/renderSwiprSlideBlob";
import { renderSwiprSwipeVideoBlob } from "@/lib/clipstitchr/media/renderSwiprSwipeVideoBlob";
import type { PostBridgeScheduleMediaFile } from "@/lib/clipstitchr/types/PostBridgeScheduleMediaFile";
import type { PostBridgeScheduleRenderOptions } from "@/lib/clipstitchr/types/PostBridgeScheduleRenderOptions";
import type { PostBridgeScheduleRenderResult } from "@/lib/clipstitchr/types/PostBridgeScheduleRenderResult";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { getPostBridgeMediaFileName } from "@/lib/clipstitchr/utils/getPostBridgeMediaFileName";
import { getSwiprPostBridgeMediaKind } from "@/lib/clipstitchr/utils/getSwiprPostBridgeMediaKind";
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";
import { getSwiprSlideFileName } from "@/lib/clipstitchr/utils/getSwiprSlideFileName";

type CreateSwiprPostBridgeScheduleMediaOptions =
  PostBridgeScheduleRenderOptions & {
    backgroundsById: Map<string, SwiprBackgroundAsset>;
    loadBackgroundBlob: (id: string) => Promise<Blob>;
    onPrimaryBackgroundLoaded?: (id: string, blob: Blob) => void;
    swipe: SwiprSwipe;
  };

export async function createSwiprPostBridgeScheduleMedia({
  backgroundsById,
  loadBackgroundBlob,
  musicTrack,
  onPrimaryBackgroundLoaded,
  onProgress,
  platforms,
  swipe,
}: CreateSwiprPostBridgeScheduleMediaOptions): Promise<PostBridgeScheduleRenderResult> {
  const primaryBackground = backgroundsById.get(swipe.backgroundId);

  if (!primaryBackground) {
    throw new Error("This Swipe is missing a photo.");
  }

  const primaryBlob =
    primaryBackground.blob ?? (await loadBackgroundBlob(primaryBackground.id));
  const slideBackgroundBlobs: Record<string, Blob> = {};

  onPrimaryBackgroundLoaded?.(primaryBackground.id, primaryBlob);

  for (const slide of swipe.slides) {
    const backgroundId = getSwiprSlideBackgroundId(slide, swipe.backgroundId);
    const slideBackgroundAsset = backgroundsById.get(backgroundId);

    if (!slideBackgroundAsset) {
      throw new Error("Unable to load this Swipe photo.");
    }

    slideBackgroundBlobs[slide.id] =
      backgroundId === primaryBackground.id
        ? primaryBlob
        : slideBackgroundAsset.blob ??
          (await loadBackgroundBlob(slideBackgroundAsset.id));
  }

  if (
    getSwiprPostBridgeMediaKind({
      hasMusic: Boolean(musicTrack),
      platforms,
    }) === "image"
  ) {
    const mediaFiles: PostBridgeScheduleMediaFile[] = [];

    for (let index = 0; index < swipe.slides.length; index += 1) {
      const slide = swipe.slides[index];
      const slideBlob = await renderSwiprSlideBlob(
        slideBackgroundBlobs[slide.id],
        slide,
      );

      mediaFiles.push({
        blob: slideBlob,
        fileName: getSwiprSlideFileName(index),
        mediaKind: "image" as const,
      });
      onProgress((index + 1) / swipe.slides.length);
    }

    return {
      hasAudio: false,
      mediaFiles,
    };
  }

  const musicBlob = musicTrack
    ? await downloadMusicBlob({
        audioObject: musicTrack.audioObject,
        sharedTrackId: musicTrack.id,
      })
    : null;
  const renderResult = await renderSwiprSwipeVideoBlob({
    musicBlob,
    onProgress,
    slideBackgroundBlobs,
    slides: swipe.slides,
  });

  return {
    hasAudio: Boolean(musicTrack),
    mediaFiles: [
      {
        blob: renderResult.blob,
        fileName: getPostBridgeMediaFileName(swipe.name, "video"),
        mediaKind: "video",
      },
    ],
  };
}
