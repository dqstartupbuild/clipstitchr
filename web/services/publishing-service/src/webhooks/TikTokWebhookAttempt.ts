import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";

export type TikTokWebhookAttempt = Readonly<{
  attemptId: string;
  postStateId: string;
  tenantId: string;
  tenantKey: PublishingTenantKey;
}>;
