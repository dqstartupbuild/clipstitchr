import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createIdentifierPublishingServiceRouteMatcher } from "../server/createIdentifierPublishingServiceRouteMatcher.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { assertPublishingApiEmptyQuery } from "./assertPublishingApiEmptyQuery.js";
import { readPublishingApiNow } from "./readPublishingApiNow.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

export const createRetryPublishingPostRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.posts.retry",
  body: "none",
  match: createIdentifierPublishingServiceRouteMatcher(
    "/v1/posts/",
    "postId",
    "/retry",
  ),
  method: "POST",
  rateLimitAction: "publish.retry",
  async handle({ claims, match, searchParams }) {
    try {
      assertPublishingApiEmptyQuery(searchParams);
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.store.ensureTenant(identity);
      return {
        status: 202,
        body: {
          post: await dependencies.store.retryPost(
            identity,
            claims.requestId,
            match["postId"]!,
            readPublishingApiNow(dependencies.now ?? (() => new Date())),
          ),
        },
      };
    } catch (error) {
      throw toPublishingApiHttpError(error);
    }
  },
});
