import type { ServiceAssertionAction } from "../assertions/ServiceAssertionAction.js";
import { createClerkTenantIdentityFromServiceClaims } from "../integrations/createClerkTenantIdentityFromServiceClaims.js";
import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { createExactPublishingServiceRouteMatcher } from "../server/createExactPublishingServiceRouteMatcher.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { assertPublishingApiEmptyQuery } from "./assertPublishingApiEmptyQuery.js";
import { readPublishingApiCreatePostRequest } from "./readPublishingApiCreatePostRequest.js";
import { readPublishingApiNow } from "./readPublishingApiNow.js";
import { toPublishingApiHttpError } from "./toPublishingApiHttpError.js";

const ACTIONS = Object.freeze({
  draft: "publishing.posts.write",
  "publish-now": "publishing.posts.publish",
  schedule: "publishing.posts.schedule",
}) satisfies Readonly<Record<string, ServiceAssertionAction>>;

export const createCreatePublishingPostRoute = (
  dependencies: PublishingApiRouteDependencies,
): PublishingServiceRoute => ({
  action: "publishing.posts.write",
  additionalActions: Object.freeze([
    "publishing.posts.publish",
    "publishing.posts.schedule",
  ]),
  body: "json",
  match: createExactPublishingServiceRouteMatcher("/v1/posts"),
  maximumBodyBytes: 65_536,
  method: "POST",
  rateLimitAction: "draft.write",
  rateLimitActionByAssertion: Object.freeze({
    "publishing.posts.publish": "publish.create",
    "publishing.posts.schedule": "schedule.create",
  }),
  async handle({ body, claims, searchParams }) {
    try {
      assertPublishingApiEmptyQuery(searchParams);
      const request = readPublishingApiCreatePostRequest(body);
      if (ACTIONS[request.intent] !== claims.action) {
        throw new PublishingServiceHttpError(403, "action_not_allowed");
      }
      const identity = createClerkTenantIdentityFromServiceClaims(claims);
      await dependencies.store.ensureTenant(identity);
      return {
        status: request.intent === "draft" ? 201 : 202,
        body: await dependencies.store.createPost(
          identity,
          claims.requestId,
          request,
          readPublishingApiNow(dependencies.now ?? (() => new Date())),
        ),
      };
    } catch (error) {
      throw toPublishingApiHttpError(error);
    }
  },
});
