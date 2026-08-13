import "server-only";

import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

export function translatePublishingMediaValidationError(
  error: PublishingMediaValidationError,
): PublishingProxyRequestError {
  if (error.code === "invalid_descriptor") {
    return new PublishingProxyRequestError(400, "invalid_media_descriptor");
  }
  if (
    error.code === "missing_media" ||
    error.code === "owner_mismatch" ||
    error.code === "source_mismatch"
  ) {
    return new PublishingProxyRequestError(404, "publishing_media_not_found");
  }
  return new PublishingProxyRequestError(422, "publishing_media_invalid");
}
