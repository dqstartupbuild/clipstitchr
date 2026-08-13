import { createProviderAuthorizationRequest } from "../provider-runtime/oauth/createProviderAuthorizationRequest.js";
import { PublishingProviderDisabledError } from "../errors/PublishingProviderDisabledError.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createIdentifierPublishingServiceRouteMatcher } from "../server/createIdentifierPublishingServiceRouteMatcher.js";
import type { PublishingIntegrationRouteDependencies } from "./PublishingIntegrationRouteDependencies.js";
import { createClerkTenantIdentityFromServiceClaims } from "./createClerkTenantIdentityFromServiceClaims.js";
import { isPublicPublishingProvider } from "./isPublicPublishingProvider.js";
import { parsePublishingConnectRequest } from "./parsePublishingConnectRequest.js";
import { selectPublishingIntegrationRuntime } from "./selectPublishingIntegrationRuntime.js";
import { toPublishingIntegrationHttpError } from "./toPublishingIntegrationHttpError.js";

export const createConnectPublishingIntegrationRoute = (
  dependencies: PublishingIntegrationRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.integrations.connect",
  body: "json",
  match: createIdentifierPublishingServiceRouteMatcher(
    "/v1/integrations/",
    "provider",
    "/connect",
  ),
  maximumBodyBytes: 1_024,
  method: "POST",
  rateLimitAction: "oauth.initiate",
  async handle({ body, claims, match }) {
    try {
      const provider = match["provider"];
      if (!isPublicPublishingProvider(provider)) {
        throw new PublishingProviderDisabledError();
      }
      const request = parsePublishingConnectRequest(body);
      const runtime = selectPublishingIntegrationRuntime(
        dependencies.runtimes,
        provider,
      );
      const authorization = await createProviderAuthorizationRequest({
        identity: createClerkTenantIdentityFromServiceClaims(claims),
        runtime,
        publicOrigin: dependencies.publicOrigin,
        returnPath: request.returnPath,
        store: dependencies.oauthStateStore,
      });

      return {
        status: 200,
        body: Object.freeze({ authorizationUrl: authorization.authorizationUrl }),
      };
    } catch (error) {
      throw toPublishingIntegrationHttpError(error);
    }
  },
});
