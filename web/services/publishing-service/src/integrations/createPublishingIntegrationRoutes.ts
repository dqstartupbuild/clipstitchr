import type { PublishingServiceRoute } from "../server/PublishingServiceRoute.js";
import type { PublishingIntegrationRouteDependencies } from "./PublishingIntegrationRouteDependencies.js";
import { createCallbackPublishingIntegrationRoute } from "./createCallbackPublishingIntegrationRoute.js";
import { createConnectPublishingIntegrationRoute } from "./createConnectPublishingIntegrationRoute.js";
import { createDisconnectPublishingIntegrationRoute } from "./createDisconnectPublishingIntegrationRoute.js";
import { createListPublishingIntegrationsRoute } from "./createListPublishingIntegrationsRoute.js";
import { createRefreshPublishingIntegrationRoute } from "./createRefreshPublishingIntegrationRoute.js";
import { createTikTokCreatorInfoRoute } from "./createTikTokCreatorInfoRoute.js";

export const createPublishingIntegrationRoutes = (
  dependencies: PublishingIntegrationRouteDependencies,
): readonly PublishingServiceRoute[] =>
  Object.freeze([
    createListPublishingIntegrationsRoute(dependencies),
    createConnectPublishingIntegrationRoute(dependencies),
    createCallbackPublishingIntegrationRoute(dependencies),
    createRefreshPublishingIntegrationRoute(dependencies),
    createDisconnectPublishingIntegrationRoute(dependencies),
    createTikTokCreatorInfoRoute(dependencies),
  ]);
