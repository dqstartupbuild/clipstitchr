import {
  SWIPR_MAX_SLIDE_COUNT,
  SWIPR_MIN_SLIDE_COUNT,
} from "../../constants/swiprSlideCountBounds";
import { TIKTOK_OUTPUT_HEIGHT, TIKTOK_OUTPUT_WIDTH } from "../../constants/tiktokOutputSize";
import { createSwipePublishingSlideObjectKey } from "./createSwipePublishingSlideObjectKey";
import { isSha256Base64Checksum } from "./isSha256Base64Checksum";
import type { SwipePublishingBundle } from "./SwipePublishingBundle";
import { SWIPE_PUBLISHING_OUTPUT_CONTRACT } from "./swipePublishingOutputContract";
import { SWIPE_PUBLISHING_RENDERER_VERSION } from "./swipePublishingRendererVersion";

type AssertSwipePublishingBundleMatchesSwipeOptions = {
  bundle: SwipePublishingBundle;
  ownerId: string;
  revision: string;
  slideCount: number;
  swipeId: string;
};

export function assertSwipePublishingBundleMatchesSwipe({
  bundle,
  ownerId,
  revision,
  slideCount,
  swipeId,
}: AssertSwipePublishingBundleMatchesSwipeOptions) {
  if (
    slideCount < SWIPR_MIN_SLIDE_COUNT ||
    slideCount > SWIPR_MAX_SLIDE_COUNT ||
    bundle.revision !== revision ||
    bundle.slides.length !== slideCount
  ) {
    throw new Error("Swipe publishing bundle does not match the saved revision.");
  }

  bundle.slides.forEach((slide, index) => {
    const expectedKey = createSwipePublishingSlideObjectKey({
      checksumSha256: slide.checksumSha256,
      ownerId,
      revision,
      slideIndex: index,
      swipeId,
    });

    if (
      slide.index !== index ||
      slide.object.key !== expectedKey ||
      slide.object.contentType !== SWIPE_PUBLISHING_OUTPUT_CONTRACT.mimeType ||
      !Number.isSafeInteger(slide.object.size) ||
      slide.object.size <= 0 ||
      !isSha256Base64Checksum(slide.checksumSha256) ||
      slide.width !== TIKTOK_OUTPUT_WIDTH ||
      slide.height !== TIKTOK_OUTPUT_HEIGHT
    ) {
      throw new Error("Swipe publishing bundle contains invalid slide metadata.");
    }

    if (
      (slide.etag !== undefined && !slide.etag.trim()) ||
      (slide.versionId !== undefined && !slide.versionId.trim())
    ) {
      throw new Error("Swipe publishing bundle contains an invalid object version.");
    }
  });

  if (
    !/^[a-f0-9]{64}$/.test(bundle.editableStateDigest) ||
    bundle.rendererVersion !== SWIPE_PUBLISHING_RENDERER_VERSION ||
    bundle.backgrounds.length < 1 ||
    bundle.backgrounds.some(
      (background) =>
        !background.id.trim() ||
        !background.objectKey.trim() ||
        !background.contentType.trim() ||
        !Number.isSafeInteger(background.sizeBytes) ||
        background.sizeBytes <= 0 ||
        (!background.checksum && !background.version),
    )
  ) {
    throw new Error("Swipe publishing bundle has invalid render inputs.");
  }
}
