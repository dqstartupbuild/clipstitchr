import { putBlobToR2 } from "@/lib/clipstitchr/client/r2/putBlobToR2";
import {
  SWIPR_MAX_SLIDE_COUNT,
  SWIPR_MIN_SLIDE_COUNT,
} from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { createSha256Base64ChecksumForBlob } from "@/lib/clipstitchr/publishing/media/createSha256Base64ChecksumForBlob";
import { requestSwipePublishingPreparation } from "@/lib/clipstitchr/publishing/media/requestSwipePublishingPreparation";
import type { SwipePublishingBundle } from "@/lib/clipstitchr/publishing/media/SwipePublishingBundle";
import { SWIPE_PUBLISHING_OUTPUT_CONTRACT } from "@/lib/clipstitchr/publishing/media/swipePublishingOutputContract";

type UploadSwipePublishingSlideBlobsOptions = {
  blobs: Blob[];
  revision: string;
  swipeId: string;
};

export async function uploadSwipePublishingSlideBlobs({
  blobs,
  revision,
  swipeId,
}: UploadSwipePublishingSlideBlobsOptions): Promise<
  | { attemptId: string; status: "uploaded" }
  | { bundle: SwipePublishingBundle; status: "reusable" }
> {
  if (
    blobs.length < SWIPR_MIN_SLIDE_COUNT ||
    blobs.length > SWIPR_MAX_SLIDE_COUNT ||
    blobs.some(
      (blob) =>
        blob.type !== SWIPE_PUBLISHING_OUTPUT_CONTRACT.mimeType || blob.size <= 0,
    )
  ) {
    throw new Error("Swipe publishing requires 3-8 rendered JPEG slides.");
  }

  const checksums = await Promise.all(
    blobs.map((blob) => createSha256Base64ChecksumForBlob(blob)),
  );

  // The server validates the saved Swipe and reserves all quota/grants first.
  const preparation = await requestSwipePublishingPreparation({
    revision,
    slides: blobs.map((blob, index) => ({
      checksumSha256: checksums[index],
      index,
      sizeBytes: blob.size,
    })),
    swipeId,
  });

  if (preparation.status === "reusable") {
    return { bundle: preparation.bundle, status: "reusable" };
  }

  if (preparation.status !== "upload") {
    throw new Error("Swipe publishing upload grants were not created.");
  }

  const grants = preparation.grants;
  const uploadResults = await Promise.allSettled(
    grants.map((grant, index) =>
      putBlobToR2({
        blob: blobs[index],
        checksumSha256: grant.checksumSha256,
        contentType: grant.contentType,
        key: grant.key,
        preventOverwrite: true,
        size: grant.size,
        url: grant.url,
      }),
    ),
  );
  const failures = uploadResults.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  if (failures.length) {
    throw new AggregateError(
      failures.map((failure) => failure.reason),
      "Unable to upload every Swipe publishing slide. Reserved immutable objects remain for deferred cleanup.",
    );
  }

  return { attemptId: preparation.attemptId, status: "uploaded" };
}
