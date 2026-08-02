import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getPublishingMediaObjectKeyPrefix } from "@/lib/clipstitchr/publishing/media/getPublishingMediaObjectKeyPrefix";
import type { PublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceDescriptor";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";

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

  if (!objectKey.startsWith(getPublishingMediaObjectKeyPrefix(ownerId, descriptor))) {
    throw new PublishingMediaValidationError(
      "invalid_object_key",
      "The saved media object does not match the selected record.",
    );
  }
}
