import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import type { PublishingThumbnailPrefillResult } from "@/lib/clipstitchr/publishing/client/contracts/PublishingThumbnailPrefillResult";

const supportedKinds = new Set<PublishingMediaDescriptor["kind"]>([
  "library-media",
  "stitch",
  "studio-clip-output",
  "studio-stitch-output",
  "swipe",
]);

export function parsePublishingThumbnailSearchParams(input: {
  thumbnailKind?: string | string[];
  thumbnailRecordId?: string | string[];
  thumbnailRevision?: string | string[];
}): PublishingThumbnailPrefillResult {
  const kind =
    typeof input.thumbnailKind === "string" ? input.thumbnailKind : null;
  const recordId =
    typeof input.thumbnailRecordId === "string"
      ? input.thumbnailRecordId.trim()
      : null;
  const mediaRevision =
    typeof input.thumbnailRevision === "string"
      ? input.thumbnailRevision.trim()
      : null;

  if (!kind && !recordId && !mediaRevision) {
    return { error: null, selection: null };
  }
  if (
    !supportedKinds.has(kind as PublishingMediaDescriptor["kind"]) ||
    !recordId ||
    !/^[A-Za-z0-9_-]{1,160}$/.test(recordId) ||
    !mediaRevision ||
    !/^[a-f0-9]{64}$/u.test(mediaRevision)
  ) {
    return {
      error:
        "This link did not contain a complete saved thumbnail choice, so the thumbnail values were ignored.",
      selection: null,
    };
  }

  return {
    error: null,
    selection: {
      media: {
        kind: kind as PublishingMediaDescriptor["kind"],
        recordId,
      },
      mediaRevision,
    },
  };
}
