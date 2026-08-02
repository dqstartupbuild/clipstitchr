import { assertPublishingMediaObjectKeyOwnership } from "@/lib/clipstitchr/publishing/media/assertPublishingMediaObjectKeyOwnership";
import { normalizePublishingMediaObject } from "@/lib/clipstitchr/publishing/media/normalizePublishingMediaObject";
import type { OwnedPublishingMediaRecord } from "@/lib/clipstitchr/publishing/media/OwnedPublishingMediaRecord";
import { parsePublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/parsePublishingMediaSourceDescriptor";
import type { PublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceDescriptor";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import type { ResolvedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/ResolvedPublishingMediaSource";

type ResolveOwnedPublishingMediaSourceOptions = {
  descriptor: PublishingMediaSourceDescriptor;
  ownerId: string;
  record: OwnedPublishingMediaRecord;
};

export function resolveOwnedPublishingMediaSource({
  descriptor: unsafeDescriptor,
  ownerId,
  record,
}: ResolveOwnedPublishingMediaSourceOptions): ResolvedPublishingMediaSource {
  const descriptor = parsePublishingMediaSourceDescriptor(unsafeDescriptor);

  if (!ownerId.trim()) {
    throw new PublishingMediaValidationError(
      "owner_mismatch",
      "Publishing media requires a server-resolved owner.",
    );
  }

  if (record.durability !== "durable") {
    throw new PublishingMediaValidationError(
      "not_durable",
      "Save this media before publishing it.",
    );
  }

  if (record.ownerId !== ownerId) {
    throw new PublishingMediaValidationError(
      "owner_mismatch",
      "This media item belongs to a different account.",
    );
  }

  if (record.kind !== descriptor.kind || record.recordId !== descriptor.recordId) {
    throw new PublishingMediaValidationError(
      "source_mismatch",
      "The saved media record does not match the requested source.",
    );
  }

  if (record.mediaObjects.length < 1 || record.mediaObjects.length > 20) {
    throw new PublishingMediaValidationError(
      "missing_media",
      "This saved item does not have a bounded durable media set.",
    );
  }

  const mediaObjects = record.mediaObjects.map((mediaObject) => {
    const normalizedObject = normalizePublishingMediaObject(mediaObject);
    assertPublishingMediaObjectKeyOwnership(
      normalizedObject.objectKey,
      ownerId,
      descriptor,
    );
    return normalizedObject;
  });

  if (
    (descriptor.kind === "stitch" || descriptor.kind === "library-media") &&
    (mediaObjects.length !== 1 || !mediaObjects[0].contentType.startsWith("video/"))
  ) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "This saved video source must resolve to one durable video object.",
    );
  }

  if (
    descriptor.kind === "swipe" &&
    (mediaObjects.length < 3 ||
      mediaObjects.length > 8 ||
      mediaObjects.some(
        (mediaObject) => mediaObject.contentType !== "image/jpeg",
      ))
  ) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "This saved Swipe must resolve to 3-8 durable JPEG carousel images.",
    );
  }

  return Object.freeze({
    kind: descriptor.kind,
    mediaObjects: Object.freeze(mediaObjects),
    ownerId,
    recordId: descriptor.recordId,
  });
}
