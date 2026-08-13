import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createExactPublishingServiceRouteMatcher } from "../server/createExactPublishingServiceRouteMatcher.js";
import type { PublishingIntegrationRouteDependencies } from "./PublishingIntegrationRouteDependencies.js";
import { createClerkTenantIdentityFromServiceClaims } from "./createClerkTenantIdentityFromServiceClaims.js";
import { createPublishingIntegrationsResponse } from "./createPublishingIntegrationsResponse.js";
import { toPublishingIntegrationHttpError } from "./toPublishingIntegrationHttpError.js";

export const createListPublishingIntegrationsRoute = (
  dependencies: PublishingIntegrationRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.integrations.read",
  body: "none",
  match: createExactPublishingServiceRouteMatcher("/v1/integrations"),
  method: "GET",
  rateLimitAction: "integration.read",
  async handle({ claims }) {
    try {
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.connectionStore.ensureTenant(identity);
      const records = await dependencies.connectionStore.list(identity.tenantKey);
      return {
        status: 200,
        body: createPublishingIntegrationsResponse(
          records,
          dependencies,
          dependencies.now?.() ?? new Date(),
        ),
      };
    } catch (error) {
      throw toPublishingIntegrationHttpError(error);
    }
  },
});
