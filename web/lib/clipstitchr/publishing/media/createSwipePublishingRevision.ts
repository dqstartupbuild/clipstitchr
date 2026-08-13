import { createSha256HexDigest } from "@/lib/clipstitchr/crypto/createSha256HexDigest";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import type { SwipePublishingBackgroundIdentity } from "@/lib/clipstitchr/publishing/media/SwipePublishingBackgroundIdentity";
import { SWIPE_PUBLISHING_RENDERER_VERSION } from "@/lib/clipstitchr/publishing/media/swipePublishingRendererVersion";
import { SWIPE_PUBLISHING_OUTPUT_CONTRACT } from "@/lib/clipstitchr/publishing/media/swipePublishingOutputContract";

type SwipePublishingRevisionSource = {
  backgrounds: SwipePublishingBackgroundIdentity[];
  editableStateDigest: string;
  rendererVersion?: string;
};

export async function createSwipePublishingRevision({
  backgrounds,
  editableStateDigest,
  rendererVersion = SWIPE_PUBLISHING_RENDERER_VERSION,
}: SwipePublishingRevisionSource) {
  return await createSha256HexDigest(
    JSON.stringify({
      backgrounds: [...backgrounds]
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((background) => ({
          checksum: background.checksum ?? null,
          contentType: background.contentType,
          id: background.id,
          objectKey: background.objectKey,
          sizeBytes: background.sizeBytes,
          version: background.version ?? null,
        })),
      editableStateDigest,
      output: {
        height: TIKTOK_OUTPUT_HEIGHT,
        mimeType: SWIPE_PUBLISHING_OUTPUT_CONTRACT.mimeType,
        quality: SWIPE_PUBLISHING_OUTPUT_CONTRACT.quality,
        width: TIKTOK_OUTPUT_WIDTH,
      },
      rendererVersion,
    }),
  );
}
