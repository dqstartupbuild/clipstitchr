import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import { PublishingProviderDisabledError } from "../errors/PublishingProviderDisabledError.js";
import type { ProviderAnalyticsMetric } from "../provider-runtime/contracts/ProviderAnalyticsMetric.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createExactPublishingServiceRouteMatcher } from "../server/createExactPublishingServiceRouteMatcher.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { assertPublishingApiEmptyQuery } from "./assertPublishingApiEmptyQuery.js";
import { readPublishingApiAnalyticsRefreshRequest } from "./readPublishingApiAnalyticsRefreshRequest.js";
import { readPublishingApiNow } from "./readPublishingApiNow.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

const INSTAGRAM_ANALYTICS_METRICS = Object.freeze([
  "views",
  "reach",
  "likes",
  "comments",
  "shares",
  "saved",
]);

export const createRefreshPublishingAnalyticsRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.analytics.refresh",
  body: "json",
  match: createExactPublishingServiceRouteMatcher("/v1/analytics/refresh"),
  maximumBodyBytes: 4_096,
  method: "POST",
  rateLimitAction: "analytics.refresh",
  async handle({ body, claims, searchParams }) {
    try {
      assertPublishingApiEmptyQuery(searchParams);
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.store.ensureTenant(identity);
      const request = readPublishingApiAnalyticsRefreshRequest(body);
      const target = await dependencies.store.prepareAnalyticsRefresh(
        identity.tenantKey,
        request.postId,
      );
      const runtime = dependencies.providerRuntimes.get(target.provider);
      if (runtime === undefined) {
        throw new PublishingProviderDisabledError();
      }
      let metrics: readonly ProviderAnalyticsMetric[];
      if (runtime.id === "tiktok") {
        metrics = await runtime.getPostAnalytics(
          target.accessToken,
          target.remotePublicationId,
        );
      } else {
        metrics = await runtime.getPostAnalytics(
          target.remotePublicationId,
          target.accessToken,
          INSTAGRAM_ANALYTICS_METRICS,
        );
      }
      const observedAt = readPublishingApiNow(
        dependencies.now ?? (() => new Date()),
      );
      const safeMetrics = await dependencies.store.saveAnalyticsRefresh(
        identity.tenantKey,
        target,
        metrics,
        observedAt,
      );
      return {
        status: 200,
        body: {
          metrics: safeMetrics,
          observedAt: observedAt.toISOString(),
          postId: target.postId,
        },
      };
    } catch (error) {
      throw toPublishingApiHttpError(error);
    }
  },
});
