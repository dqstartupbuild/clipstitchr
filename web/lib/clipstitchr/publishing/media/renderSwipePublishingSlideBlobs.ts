import {
  SWIPR_MAX_SLIDE_COUNT,
  SWIPR_MIN_SLIDE_COUNT,
} from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { renderSwiprSlideBlob } from "@/lib/clipstitchr/media/renderSwiprSlideBlob";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";
import { getSwiprSlideBackgroundId } from "@/lib/clipstitchr/utils/getSwiprSlideBackgroundId";
import { SWIPE_PUBLISHING_OUTPUT_CONTRACT } from "@/lib/clipstitchr/publishing/media/swipePublishingOutputContract";

type RenderSwipePublishingSlideBlobsOptions = {
  backgroundsById: Map<string, SwiprBackgroundAsset>;
  loadBackgroundBlob: (id: string) => Promise<Blob>;
  swipe: SwiprSwipe;
};

export async function renderSwipePublishingSlideBlobs({
  backgroundsById,
  loadBackgroundBlob,
  swipe,
}: RenderSwipePublishingSlideBlobsOptions) {
  if (
    swipe.slides.length < SWIPR_MIN_SLIDE_COUNT ||
    swipe.slides.length > SWIPR_MAX_SLIDE_COUNT
  ) {
    throw new Error(
      `A Swipe publishing bundle needs ${SWIPR_MIN_SLIDE_COUNT}-${SWIPR_MAX_SLIDE_COUNT} slides.`,
    );
  }

  const backgroundBlobs = new Map<string, Promise<Blob>>();

  return await Promise.all(
    swipe.slides.map(async (slide) => {
      const backgroundId = getSwiprSlideBackgroundId(
        slide,
        swipe.backgroundId,
      );
      const background = backgroundsById.get(backgroundId);

      if (!background) {
        throw new Error("This Swipe is missing a saved background.");
      }

      let backgroundBlob = backgroundBlobs.get(backgroundId);

      if (!backgroundBlob) {
        backgroundBlob = background.blob
          ? Promise.resolve(background.blob)
          : loadBackgroundBlob(background.id);
        backgroundBlobs.set(backgroundId, backgroundBlob);
      }

      return await renderSwiprSlideBlob(
        await backgroundBlob,
        slide,
        SWIPE_PUBLISHING_OUTPUT_CONTRACT,
      );
    }),
  );
}
