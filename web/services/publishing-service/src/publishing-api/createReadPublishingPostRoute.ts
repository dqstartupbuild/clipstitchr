import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createIdentifierPublishingServiceRouteMatcher } from "../server/createIdentifierPublishingServiceRouteMatcher.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { assertPublishingApiEmptyQuery } from "./assertPublishingApiEmptyQuery.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

export const createReadPublishingPostRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.posts.read",
  body: "none",
  match: createIdentifierPublishingServiceRouteMatcher("/v1/posts/", "postId"),
  method: "GET",
  rateLimitAction: "status.poll",
  async handle({ claims, match, searchParams }) {
    try {
      assertPublishingApiEmptyQuery(searchParams);
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.store.ensureTenant(identity);
      return {
        status: 200,
        body: {
          post: await dependencies.store.readPost(
            identity.tenantKey,
            match["postId"]!,
          ),
        },
      };
    } catch (error) {
      throw toPublishingApiHttpError(error);
    }
  },
});
