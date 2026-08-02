import {
  SWIPR_MAX_SLIDE_COUNT,
  SWIPR_MIN_SLIDE_COUNT,
} from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { isSha256Base64Checksum } from "@/lib/clipstitchr/publishing/media/isSha256Base64Checksum";
import { MAX_SWIPE_PUBLISHING_SLIDE_BYTES } from "@/lib/clipstitchr/publishing/media/maxSwipePublishingSlideBytes";

const SWIPE_PUBLISHING_PREPARATION_BODY_MAX_BYTES = 8 * 1024;

type SwipePublishingPreparationSlideRequest = {
  checksumSha256: string;
  index: number;
  sizeBytes: number;
};

export type SwipePublishingPreparationRequest = {
  revision?: string;
  slides?: SwipePublishingPreparationSlideRequest[];
  swipeId: string;
};

export async function readSwipePublishingPreparationRequest(
  request: Request,
): Promise<SwipePublishingPreparationRequest> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > SWIPE_PUBLISHING_PREPARATION_BODY_MAX_BYTES) {
    throw new Error("Swipe publishing request is too large.");
  }

  if (!request.body) {
    throw new Error("Missing Swipe publishing request.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    byteLength += value.byteLength;

    if (byteLength > SWIPE_PUBLISHING_PREPARATION_BODY_MAX_BYTES) {
      await reader.cancel();
      throw new Error("Swipe publishing request is too large.");
    }

    chunks.push(value);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let body: Partial<SwipePublishingPreparationRequest>;

  try {
    body = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SwipePublishingPreparationRequest>;
  } catch {
    throw new Error("Invalid Swipe publishing request.");
  }

  if (typeof body.swipeId !== "string" || !body.swipeId.trim()) {
    throw new Error("Missing Swipe ID.");
  }

  if (body.slides === undefined) {
    return { swipeId: body.swipeId.trim() };
  }

  if (
    !Array.isArray(body.slides) ||
    body.slides.length < SWIPR_MIN_SLIDE_COUNT ||
    body.slides.length > SWIPR_MAX_SLIDE_COUNT
  ) {
    throw new Error("Swipe publishing requires 3-8 slides.");
  }

  if (typeof body.revision !== "string" || !/^[a-f0-9]{64}$/.test(body.revision)) {
    throw new Error("Invalid Swipe publishing revision.");
  }

  const slides = body.slides.map((slide, index) => {
    if (
      !slide ||
      slide.index !== index ||
      !isSha256Base64Checksum(slide.checksumSha256) ||
      !Number.isSafeInteger(slide.sizeBytes) ||
      slide.sizeBytes <= 0 ||
      slide.sizeBytes > MAX_SWIPE_PUBLISHING_SLIDE_BYTES
    ) {
      throw new Error("Invalid Swipe publishing slide upload.");
    }

    return {
      checksumSha256: slide.checksumSha256,
      index,
      sizeBytes: slide.sizeBytes,
    };
  });

  return {
    revision: body.revision,
    slides,
    swipeId: body.swipeId.trim(),
  };
}
