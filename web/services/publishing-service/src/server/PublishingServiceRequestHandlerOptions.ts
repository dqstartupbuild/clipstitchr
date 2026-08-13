import type { ReadinessDependency } from "../health/ReadinessDependency.js";
import type { PublishingRateLimiter } from "../rate-limits/PublishingRateLimiter.js";
import type { PublishingServiceAuthenticationOptions } from "./PublishingServiceAuthenticationOptions.js";
import type { PublishingServiceRoute } from "./PublishingServiceRoute.js";
import type { TikTokWebhookHttpHandler } from "../webhooks/TikTokWebhookHttpHandler.js";

export type PublishingServiceRequestHandlerOptions = Readonly<{
  authentication?: PublishingServiceAuthenticationOptions;
  rateLimiter?: PublishingRateLimiter;
  readinessDependencies: readonly ReadinessDependency[];
  readinessTimeoutMilliseconds?: number;
  routes?: readonly PublishingServiceRoute[];
  studioBetaEnabled: boolean;
  tikTokWebhookHandler?: TikTokWebhookHttpHandler;
}>;
