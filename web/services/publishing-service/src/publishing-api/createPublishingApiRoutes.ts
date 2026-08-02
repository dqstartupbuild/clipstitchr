import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import type { PublishingApiRouteDependencies } from "./PublishingApiRouteDependencies.js";
import { createCancelPublishingPostRoute } from "./createCancelPublishingPostRoute.js";
import { createCreatePublishingPostRoute } from "./createCreatePublishingPostRoute.js";
import { createInspectPublishingCompatibilityRoute } from "./createInspectPublishingCompatibilityRoute.js";
import { createListPublishingAnalyticsRoute } from "./createListPublishingAnalyticsRoute.js";
import { createListPublishingCalendarRoute } from "./createListPublishingCalendarRoute.js";
import { createListPublishingPostsRoute } from "./createListPublishingPostsRoute.js";
import { createReadPublishingPostRoute } from "./createReadPublishingPostRoute.js";
import { createRefreshPublishingAnalyticsRoute } from "./createRefreshPublishingAnalyticsRoute.js";
import { createRetryPublishingPostRoute } from "./createRetryPublishingPostRoute.js";

export const createPublishingApiRoutes = (
  dependencies: PublishingApiRouteDependencies,
): readonly PublishingServiceRoute[] =>
  Object.freeze([
    createInspectPublishingCompatibilityRoute(dependencies),
    createListPublishingPostsRoute(dependencies),
    createCreatePublishingPostRoute(dependencies),
    createReadPublishingPostRoute(dependencies),
    createCancelPublishingPostRoute(dependencies),
    createRetryPublishingPostRoute(dependencies),
    createListPublishingCalendarRoute(dependencies),
    createListPublishingAnalyticsRoute(dependencies),
    createRefreshPublishingAnalyticsRoute(dependencies),
  ]);
