import "server-only";

import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import type { PublishingApiMediaResolution } from "@/lib/clipstitchr/publishing/api/PublishingApiMediaResolution";
import type { ResolvePublishingApiMediaOptions } from "@/lib/clipstitchr/publishing/api/ResolvePublishingApiMediaOptions";
import { createPublishingResolvedMediaManifest } from "@/lib/clipstitchr/publishing/api/createPublishingResolvedMediaManifest";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import { resolvePublishingMediaSourceForServer } from "@/lib/clipstitchr/publishing/media/server/resolvePublishingMediaSourceForServer";
import { translatePublishingMediaValidationError } from "@/lib/clipstitchr/publishing/api/translatePublishingMediaValidationError";

export async function resolvePublishingApiMedia(
  { convex, descriptor, productId }: ResolvePublishingApiMediaOptions,
): Promise<PublishingApiMediaResolution> {
  try {
    const { bucketName } = getR2Environment();
    const source = await resolvePublishingMediaSourceForServer({
      bucketName,
      convex,
      descriptor,
      headClient: createR2Client(),
      productId,
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
