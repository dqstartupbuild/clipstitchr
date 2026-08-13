import type { TikTokWebhookAttempt } from "./TikTokWebhookAttempt.js";

export type TikTokWebhookOutboxNudger = (
  attempt: TikTokWebhookAttempt,
  nudgedAt: Date,
) => Promise<void>;
