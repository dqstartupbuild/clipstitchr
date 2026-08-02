import type { PublishingMediaPrefillResult } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaPrefillResult";

export function parsePublishingMediaDescriptorSearchParams(input: {
  kind?: string | string[];
  recordId?: string | string[];
}): PublishingMediaPrefillResult {
  const kind = typeof input.kind === "string" ? input.kind : null;
  const recordId =
    typeof input.recordId === "string" ? input.recordId.trim() : null;

  if (!kind && !recordId) {
    return { descriptor: null, error: null };
  }

  if (
    !["library-media", "stitch", "swipe"].includes(kind ?? "") ||
    !recordId ||
    !/^[A-Za-z0-9_-]{1,160}$/.test(recordId)
  ) {
    return {
      descriptor: null,
      error:
        "This publishing link did not contain a safe saved-media reference, so those link values were ignored.",
    };
  }

  return {
    descriptor: {
      kind: kind as "library-media" | "stitch" | "swipe",
      recordId,
    },
    error: null,
  };
}
