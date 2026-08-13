import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createIdentifierPublishingServiceRouteMatcher } from "../server/createIdentifierPublishingServiceRouteMatcher.js";
import type { PublishingIntegrationRouteDependencies } from "./PublishingIntegrationRouteDependencies.js";
import { createClerkTenantIdentityFromServiceClaims } from "./createClerkTenantIdentityFromServiceClaims.js";
import { createPublishingIntegrationsResponse } from "./createPublishingIntegrationsResponse.js";
import { readPublishingRouteIdentifier } from "./readPublishingRouteIdentifier.js";
import { toPublishingIntegrationHttpError } from "./toPublishingIntegrationHttpError.js";

export const createDisconnectPublishingIntegrationRoute = (
  dependencies: PublishingIntegrationRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.integrations.disconnect",
  body: "none",
  match: createIdentifierPublishingServiceRouteMatcher(
    "/v1/integrations/",
    "integrationId",
  ),
  method: "DELETE",
  rateLimitAction: "integration.disconnect",
  async handle({ claims, match }) {
    try {
      const integrationId = readPublishingRouteIdentifier(
        match["integrationId"],
      );
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.connectionStore.ensureTenant(identity);
      await dependencies.connectionStore.disconnect(
        identity,
        integrationId,
        claims.requestId,
      );
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
