import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createExactPublishingServiceRouteMatcher } from "../server/createExactPublishingServiceRouteMatcher.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { readPublishingApiCalendarQuery } from "./readPublishingApiCalendarQuery.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

export const createListPublishingCalendarRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.posts.read",
  body: "none",
  match: createExactPublishingServiceRouteMatcher("/v1/calendar"),
  method: "GET",
  rateLimitAction: "status.poll",
  async handle({ claims, searchParams }) {
    try {
      const query = readPublishingApiCalendarQuery(searchParams);
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.store.ensureTenant(identity);
      return {
        status: 200,
        body: {
          from: query.from,
          posts: await dependencies.store.listCalendar(
            identity.tenantKey,
            query.productId,
            query.fromDate,
            query.toDate,
          ),
          timeZone: query.timeZone,
          productId: query.productId,
          to: query.to,
        },
      };
    } catch (error) {
      throw toPublishingApiHttpError(error);
    }
  },
});
