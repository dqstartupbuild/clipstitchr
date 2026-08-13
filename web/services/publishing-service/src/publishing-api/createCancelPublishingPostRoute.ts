import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { createIdentifierPublishingServiceRouteMatcher } from "../server/createIdentifierPublishingServiceRouteMatcher.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { assertPublishingApiEmptyQuery } from "./assertPublishingApiEmptyQuery.js";
import { readPublishingApiProductRequest } from "./readPublishingApiProductRequest.js";
import { readPublishingApiNow } from "./readPublishingApiNow.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

export const createCancelPublishingPostRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.posts.cancel",
  body: "json",
  match: createIdentifierPublishingServiceRouteMatcher(
    "/v1/posts/",
    "postId",
    "/cancel",
  ),
  method: "POST",
  maximumBodyBytes: 1_024,
  rateLimitAction: "publish.cancel",
  async handle({ body, claims, match, searchParams }) {
    try {
      assertPublishingApiEmptyQuery(searchParams);
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      const request = readPublishingApiProductRequest(body);
      await dependencies.store.ensureTenant(identity);
      return {
        status: 200,
        body: {
          post: await dependencies.store.cancelPost(
            identity,
            claims.requestId,
            request.productId,
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
