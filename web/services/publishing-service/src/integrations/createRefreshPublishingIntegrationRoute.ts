import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createIdentifierPublishingServiceRouteMatcher } from "../server/createIdentifierPublishingServiceRouteMatcher.js";
import type { PublishingIntegrationRouteDependencies } from "./PublishingIntegrationRouteDependencies.js";
import { createClerkTenantIdentityFromServiceClaims } from "./createClerkTenantIdentityFromServiceClaims.js";
import { createPublishingIntegrationsResponse } from "./createPublishingIntegrationsResponse.js";
import { readPublishingRouteIdentifier } from "./readPublishingRouteIdentifier.js";
import { refreshPublishingProviderConnection } from "./refreshPublishingProviderConnection.js";
import { toPublishingIntegrationHttpError } from "./toPublishingIntegrationHttpError.js";

export const createRefreshPublishingIntegrationRoute = (
  dependencies: PublishingIntegrationRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.integrations.refresh",
  body: "none",
  match: createIdentifierPublishingServiceRouteMatcher(
    "/v1/integrations/",
    "integrationId",
    "/refresh",
  ),
  method: "POST",
  rateLimitAction: "integration.refresh",
  async handle({ claims, match }) {
    try {
      const integrationId = readPublishingRouteIdentifier(
        match["integrationId"],
      );
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.connectionStore.ensureTenant(identity);
      await dependencies.connectionStore.refreshConnection(
        identity.tenantKey,
        integrationId,
        (credentials) =>
          refreshPublishingProviderConnection(
            dependencies.runtimes,
            credentials,
          ),
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
