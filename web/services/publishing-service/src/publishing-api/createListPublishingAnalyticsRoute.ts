import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createExactPublishingServiceRouteMatcher } from "../server/createExactPublishingServiceRouteMatcher.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { readPublishingApiAnalyticsQuery } from "./readPublishingApiAnalyticsQuery.js";
import { readPublishingApiNow } from "./readPublishingApiNow.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

export const createListPublishingAnalyticsRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.analytics.read",
  body: "none",
  match: createExactPublishingServiceRouteMatcher("/v1/analytics"),
  method: "GET",
  rateLimitAction: "status.poll",
  async handle({ claims, searchParams }) {
    try {
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.store.ensureTenant(identity);
      return {
        status: 200,
        body: await dependencies.store.listAnalytics(
          identity.tenantKey,
          readPublishingApiAnalyticsQuery(searchParams),
          readPublishingApiNow(dependencies.now ?? (() => new Date())),
        ),
      };
    } catch (error) {
      throw toPublishingApiHttpError(error);
    }
  },
});
