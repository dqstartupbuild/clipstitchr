import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createExactPublishingServiceRouteMatcher } from "../server/createExactPublishingServiceRouteMatcher.js";
import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { assertPublishingApiEmptyQuery } from "./assertPublishingApiEmptyQuery.js";
import { readPublishingApiCompatibilityRequest } from "./readPublishingApiCompatibilityRequest.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

export const createInspectPublishingCompatibilityRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.media.read",
  body: "json",
  match: createExactPublishingServiceRouteMatcher("/v1/media/compatibility"),
  maximumBodyBytes: 65_536,
  method: "POST",
  rateLimitAction: "media.fetch-url",
  async handle({ body, claims, searchParams }) {
    try {
      assertPublishingApiEmptyQuery(searchParams);
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.store.ensureTenant(identity);
      return {
        status: 200,
        body: await dependencies.store.inspectCompatibility(
          identity.tenantKey,
          readPublishingApiCompatibilityRequest(body),
        ),
      };
    } catch (error) {
      throw toPublishingApiHttpError(error);
    }
  },
});
