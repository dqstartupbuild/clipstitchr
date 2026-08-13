import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getPublishingMediaObjectKeyPrefix } from "@/lib/clipstitchr/publishing/media/getPublishingMediaObjectKeyPrefix";
import type { PublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceDescriptor";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import { createUserR2KeyPrefix } from "@/lib/clipstitchr/server/r2/createUserR2KeyPrefix";
import { sanitizeR2KeySegment } from "@/lib/clipstitchr/server/r2/sanitizeR2KeySegment";

export function assertPublishingMediaObjectKeyOwnership(
  objectKey: string,
  ownerId: string,
  descriptor: PublishingMediaSourceDescriptor,
) {
  if (
    typeof objectKey !== "string" ||
    !objectKey ||
    objectKey.length > 1024 ||
    objectKey.includes("\\") ||
    objectKey.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    throw new PublishingMediaValidationError(
      "invalid_object_key",
      "The saved media object key is invalid.",
    );
  }

  try {
    assertR2ObjectKeyBelongsToUser(objectKey, ownerId);
  } catch {
    throw new PublishingMediaValidationError(
      "owner_mismatch",
      "This media item belongs to a different account.",
    );
  }

  const matchesLibraryPhoto =
    descriptor.kind === "library-media" &&
    objectKey.startsWith(
      `${createUserR2KeyPrefix(ownerId)}photos/${sanitizeR2KeySegment(descriptor.recordId)}/`,
    );

  if (
    !matchesLibraryPhoto &&
    !objectKey.startsWith(
      getPublishingMediaObjectKeyPrefix(ownerId, descriptor),
    )
  ) {
    throw new PublishingMediaValidationError(
      "invalid_object_key",
      "The saved media object does not match the selected record.",
    );
  }
}
