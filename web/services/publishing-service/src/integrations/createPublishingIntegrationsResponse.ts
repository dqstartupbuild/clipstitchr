import type { PublishingIntegrationRecord } from "./PublishingIntegrationRecord.js";
import type { PublishingIntegrationsResponse } from "./PublishingIntegrationsResponse.js";
import type { PublishingIntegrationRouteDependencies } from "./PublishingIntegrationRouteDependencies.js";
import { hasPublicPublishingRuntime } from "./hasPublicPublishingRuntime.js";
import { mapPublishingIntegrationRecord } from "./mapPublishingIntegrationRecord.js";

export const createPublishingIntegrationsResponse = (
  records: readonly PublishingIntegrationRecord[],
  dependencies: Pick<PublishingIntegrationRouteDependencies, "runtimes">,
  now: Date,
): PublishingIntegrationsResponse => {
  const instagramAvailable = hasPublicPublishingRuntime(
    dependencies.runtimes,
    "instagram",
  );
  const tikTokAvailable = hasPublicPublishingRuntime(
    dependencies.runtimes,
    "tiktok",
  );
  const youTubeAvailable = hasPublicPublishingRuntime(
    dependencies.runtimes,
    "youtube",
  );
  const instagram = records
    .filter(
      ({ providerIdentifier, type }) =>
        (providerIdentifier === "instagram" ||
          providerIdentifier === "instagram-standalone") &&
        providerIdentifier === type,
    )
    .map((record) => mapPublishingIntegrationRecord(record, "instagram", now));
  const tikTok = records
    .filter(
      ({ providerIdentifier, type }) =>
        providerIdentifier === "tiktok" && type === "tiktok",
    )
    .map((record) => mapPublishingIntegrationRecord(record, "tiktok", now));
  const youTube = records
    .filter(
      ({ providerIdentifier, type }) =>
        providerIdentifier === "youtube" && type === "youtube",
    )
    .map((record) => mapPublishingIntegrationRecord(record, "youtube", now));

  return Object.freeze({
    providers: Object.freeze([
      Object.freeze({
        canConnect: instagramAvailable,
        integrations: Object.freeze(instagram),
        provider: "instagram" as const,
        unavailableReason: instagramAvailable
          ? null
          : "Instagram connections aren’t available yet.",
      }),
      Object.freeze({
        canConnect: tikTokAvailable,
        integrations: Object.freeze(tikTok),
        provider: "tiktok" as const,
        unavailableReason: tikTokAvailable
          ? null
          : "TikTok connections aren’t available yet.",
      }),
      Object.freeze({
        canConnect: youTubeAvailable,
        integrations: Object.freeze(youTube),
        provider: "youtube" as const,
        unavailableReason: youTubeAvailable
          ? null
          : "YouTube connections aren’t available yet.",
      }),
    ]),
  });
};
