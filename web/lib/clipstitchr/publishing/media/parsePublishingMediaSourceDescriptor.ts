import type { PublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceDescriptor";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";

const publishingMediaSourceKinds = new Set([
  "stitch",
  "swipe",
  "library-media",
]);

const recordIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export function parsePublishingMediaSourceDescriptor(
  value: unknown,
): PublishingMediaSourceDescriptor {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PublishingMediaValidationError(
      "invalid_descriptor",
      "Choose a saved ClipStitchr media item.",
    );
  }

  const keys = Object.keys(value).sort();

  if (keys.length !== 2 || keys[0] !== "kind" || keys[1] !== "recordId") {
    throw new PublishingMediaValidationError(
      "invalid_descriptor",
      "Publishing media accepts only a saved item type and record ID.",
    );
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.kind !== "string" ||
    !publishingMediaSourceKinds.has(candidate.kind)
  ) {
    throw new PublishingMediaValidationError(
      "invalid_descriptor",
      "This saved media type is not supported for publishing.",
    );
  }

  if (
    typeof candidate.recordId !== "string" ||
    !recordIdPattern.test(candidate.recordId)
  ) {
    throw new PublishingMediaValidationError(
      "invalid_descriptor",
      "The saved media record ID is invalid.",
    );
  }

  return {
    kind: candidate.kind as PublishingMediaSourceDescriptor["kind"],
    recordId: candidate.recordId,
  };
}
