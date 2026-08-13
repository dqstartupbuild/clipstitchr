import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import type { PublishingMediaObject } from "@/lib/clipstitchr/publishing/media/PublishingMediaObject";
import { inspectPublishingMediaCompatibility } from "@/lib/clipstitchr/publishing/media/inspectPublishingMediaCompatibility";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

export function assertPublishingMediaCompatibility(
  destinations: readonly Readonly<{ provider: PublishingProvider }>[],
  mediaObjects: readonly PublishingMediaObject[],
): void {
  for (const destination of destinations) {
    const report = inspectPublishingMediaCompatibility(
      destination.provider,
      mediaObjects,
    );
    if (report.issues.some((issue) => issue.severity === "error")) {
      throw new PublishingProxyRequestError(422, "incompatible_media");
    }
  }
}
