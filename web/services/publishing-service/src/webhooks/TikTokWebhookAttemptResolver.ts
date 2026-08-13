import type { TikTokWebhookAttempt } from "./TikTokWebhookAttempt.js";

export type TikTokWebhookAttemptResolver = (
  publishId: string,
) => Promise<TikTokWebhookAttempt | null>;
