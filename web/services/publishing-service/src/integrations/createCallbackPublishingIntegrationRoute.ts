import { consumeOAuthAuthorizationRequestState } from "../oauth/consumeOAuthAuthorizationRequestState.js";
import { PublishingProviderDisabledError } from "../errors/PublishingProviderDisabledError.js";
import type { ProviderConnection } from "../provider-runtime/contracts/ProviderConnection.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createIdentifierPublishingServiceRouteMatcher } from "../server/createIdentifierPublishingServiceRouteMatcher.js";
import type { PublishingIntegrationRouteDependencies } from "./PublishingIntegrationRouteDependencies.js";
import { createClerkTenantIdentityFromServiceClaims } from "./createClerkTenantIdentityFromServiceClaims.js";
import { createFacebookInstagramConnections } from "./createFacebookInstagramConnections.js";
import { isPublicPublishingProvider } from "./isPublicPublishingProvider.js";
import { parsePublishingCallbackRequest } from "./parsePublishingCallbackRequest.js";
import { selectPublishingIntegrationRuntime } from "./selectPublishingIntegrationRuntime.js";
import { toPublishingIntegrationHttpError } from "./toPublishingIntegrationHttpError.js";

export const createCallbackPublishingIntegrationRoute = (
  dependencies: PublishingIntegrationRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.integrations.callback",
  body: "json",
  match: createIdentifierPublishingServiceRouteMatcher(
    "/v1/integrations/",
    "provider",
    "/callback",
  ),
  maximumBodyBytes: 4_096,
  method: "POST",
  rateLimitAction: "oauth.callback",
  async handle({ body, claims, match }) {
    try {
      const provider = match["provider"];
      if (!isPublicPublishingProvider(provider)) {
        throw new PublishingProviderDisabledError();
      }
      const request = parsePublishingCallbackRequest(body);
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      const runtime = selectPublishingIntegrationRuntime(
        dependencies.runtimes,
        provider,
      );
      const consumed = await consumeOAuthAuthorizationRequestState({
        state: request.state,
        expectedIdentity: identity,
        expectedProvider: runtime.id,
        expectedPkceMode: runtime.pkceMode ?? "none",
        expectedPublicOrigin: dependencies.publicOrigin,
        expectedReturnPath: "/dashboard/studio/publishing/integrations",
        store: dependencies.oauthStateStore,
      });

      if ("denied" in request) {
        return {
          status: 200,
          body: Object.freeze({ outcome: "cancelled" as const }),
        };
      }

      const exchanged = await runtime.exchangeAuthorizationCode(
        request.code,
        consumed.redirectUri,
        consumed.pkceMode === "rfc7636-s256"
          ? consumed.codeVerifier
          : undefined,
      );
      let connections: readonly ProviderConnection[];

      if (runtime.id === "instagram") {
        const accounts = await runtime.listInstagramAccounts(
          exchanged.accessToken,
        );
        connections = createFacebookInstagramConnections(exchanged, accounts);
      } else if (runtime.id === "youtube") {
        connections = await runtime.listYouTubeChannels(exchanged);
      } else {
        connections = Object.freeze([exchanged]);
      }

      await dependencies.connectionStore.ensureTenant(identity);
      await dependencies.connectionStore.saveConnections(
        identity.tenantKey,
        connections,
      );

      return {
        status: 200,
        body: Object.freeze({
          connectedCount: connections.length,
          outcome: "connected" as const,
        }),
      };
    } catch (error) {
      throw toPublishingIntegrationHttpError(error);
    }
  },
});
