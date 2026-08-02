import "server-only";

import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import type { PublishingApiMediaResolution } from "@/lib/clipstitchr/publishing/api/PublishingApiMediaResolution";
import { createPublishingResolvedMediaManifest } from "@/lib/clipstitchr/publishing/api/createPublishingResolvedMediaManifest";
import { PublishingAuthenticationError } from "@/lib/clipstitchr/publishing/identity/PublishingAuthenticationError";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import { resolvePublishingMediaSourceForServer } from "@/lib/clipstitchr/publishing/media/server/resolvePublishingMediaSourceForServer";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

function translatePublishingMediaValidationError(
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

export async function resolvePublishingApiMedia(
  descriptor: unknown,
): Promise<PublishingApiMediaResolution> {
  const token = await getAuthenticatedConvexToken();
  if (!token) {
    throw new PublishingAuthenticationError();
  }

  try {
    const convex = createAuthenticatedConvexHttpClient(token);
    const { bucketName } = getR2Environment();
    const source = await resolvePublishingMediaSourceForServer({
      bucketName,
      convex,
      descriptor,
      headClient: createR2Client(),
    });

    return Object.freeze({
      manifest: createPublishingResolvedMediaManifest(source),
      mediaObjects: source.mediaObjects,
    });
  } catch (error) {
    if (error instanceof PublishingMediaValidationError) {
      throw translatePublishingMediaValidationError(error);
    }
    throw error;
  }
}
