import type { PublishingRateLimiter } from "../rate-limits/PublishingRateLimiter.js";
import type { TikTokWebhookReplayProtector } from "../provider-runtime/tiktok/TikTokWebhookReplayProtector.js";
import type { TikTokWebhookAttemptResolver } from "./TikTokWebhookAttemptResolver.js";
import type { TikTokWebhookOutboxNudger } from "./TikTokWebhookOutboxNudger.js";

export type CreateTikTokWebhookHttpHandlerOptions = Readonly<{
  attemptResolver: TikTokWebhookAttemptResolver;
  clientKey: string;
  clientSecret: string;
  now?: () => number;
  outboxNudger: TikTokWebhookOutboxNudger;
  rateLimiter: PublishingRateLimiter;
  replayProtector: TikTokWebhookReplayProtector;
}>;
