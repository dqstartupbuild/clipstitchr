import { createUserR2KeyPrefix } from "@/lib/clipstitchr/server/r2/createUserR2KeyPrefix";
import { sanitizeR2KeySegment } from "@/lib/clipstitchr/server/r2/sanitizeR2KeySegment";
import { SWIPE_PUBLISHING_OUTPUT_CONTRACT } from "@/lib/clipstitchr/publishing/media/swipePublishingOutputContract";

type CreateSwipePublishingSlideObjectKeyOptions = {
  checksumSha256: string;
  ownerId: string;
  revision: string;
  slideIndex: number;
  swipeId: string;
};

export function createSwipePublishingSlideObjectKey({
  checksumSha256,
  ownerId,
  revision,
  slideIndex,
  swipeId,
}: CreateSwipePublishingSlideObjectKeyOptions) {
  if (!/^[a-f0-9]{64}$/.test(revision)) {
    throw new Error("Swipe publishing revision must be a SHA-256 digest.");
  }

  if (!Number.isInteger(slideIndex) || slideIndex < 0 || slideIndex > 7) {
    throw new Error("Swipe publishing slide index is out of range.");
  }

  if (!/^[A-Za-z0-9+/]{43}=$/.test(checksumSha256)) {
    throw new Error("Swipe publishing checksum must be base64 SHA-256.");
  }

  const checksumKey = checksumSha256
    .slice(0, -1)
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return [
    createUserR2KeyPrefix(ownerId).replace(/\/$/, ""),
    "swipes",
    sanitizeR2KeySegment(swipeId),
    "publishing",
    revision,
    `slide-${String(slideIndex + 1).padStart(2, "0")}-${checksumKey}.${SWIPE_PUBLISHING_OUTPUT_CONTRACT.fileExtension}`,
  ].join("/");
}
