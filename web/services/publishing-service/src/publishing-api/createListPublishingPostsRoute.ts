import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createExactPublishingServiceRouteMatcher } from "../server/createExactPublishingServiceRouteMatcher.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { readPublishingApiPostsQuery } from "./readPublishingApiPostsQuery.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

export const createListPublishingPostsRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.posts.read",
  body: "none",
  match: createExactPublishingServiceRouteMatcher("/v1/posts"),
  method: "GET",
  rateLimitAction: "status.poll",
  async handle({ claims, searchParams }) {
    try {
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.store.ensureTenant(identity);
      const query = readPublishingApiPostsQuery(searchParams);
      return {
        status: 200,
        body: {
          posts: await dependencies.store.listPosts(
            identity.tenantKey,
            query.productId,
            query.status,
          ),
        },
      };
    } catch (error) {
      throw toPublishingApiHttpError(error);
    }
  },
});
