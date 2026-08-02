import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { createExactPublishingServiceRouteMatcher } from "../server/createExactPublishingServiceRouteMatcher.js";
import type { PublishingIntegrationRouteDependencies } from "./PublishingIntegrationRouteDependencies.js";
import { createClerkTenantIdentityFromServiceClaims } from "./createClerkTenantIdentityFromServiceClaims.js";
import { readPublishingRouteIdentifier } from "./readPublishingRouteIdentifier.js";
import { selectPublishingIntegrationRuntime } from "./selectPublishingIntegrationRuntime.js";
import { toPublishingIntegrationHttpError } from "./toPublishingIntegrationHttpError.js";

export const createTikTokCreatorInfoRoute = (
  dependencies: PublishingIntegrationRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.status.poll",
  body: "none",
  match: createExactPublishingServiceRouteMatcher(
    "/v1/integrations/tiktok/creator-info",
  ),
  method: "GET",
  rateLimitAction: "status.poll",
  async handle({ claims, searchParams }) {
    try {
      if (
        [...searchParams.keys()].some((key) => key !== "integrationId") ||
        searchParams.getAll("integrationId").length !== 1
      ) {
        throw new PublishingServiceHttpError(400, "invalid_request");
      }
      const integrationId = readPublishingRouteIdentifier(
        searchParams.get("integrationId") ?? undefined,
      );
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      const runtime = selectPublishingIntegrationRuntime(
        dependencies.runtimes,
        "tiktok",
      );
      if (runtime.id !== "tiktok") {
        throw new ProviderRuntimeError("tiktok", "invalid_configuration");
      }

      await dependencies.connectionStore.ensureTenant(identity);
      const accessToken = await dependencies.connectionStore.readAccessToken(
        identity.tenantKey,
        integrationId,
        "tiktok",
      );
      if (accessToken === null) {
        throw new ProviderRuntimeError("tiktok", "auth_required");
      }
      const creatorInfo = await runtime.getCreatorInfo(accessToken);

      return {
        status: 200,
        body: Object.freeze({
          creatorInfo: Object.freeze({
            commentsDisabled: creatorInfo.commentsDisabled,
            duetDisabled: creatorInfo.duetDisabled,
            fetchedAtEpochMilliseconds:
              creatorInfo.fetchedAtEpochMilliseconds,
            maxVideoDurationSeconds: creatorInfo.maxVideoDurationSeconds,
            nickname: creatorInfo.nickname ?? null,
            privacyLevelOptions: Object.freeze([
              ...creatorInfo.privacyLevelOptions,
            ]),
            stitchDisabled: creatorInfo.stitchDisabled,
            username: creatorInfo.username ?? null,
          }),
        }),
      };
    } catch (error) {
      throw toPublishingIntegrationHttpError(error);
    }
  },
});
