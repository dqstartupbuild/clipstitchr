import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { TikTokWebhookReplayProtector } from "./TikTokWebhookReplayProtector.js";
import type { VerifiedTikTokWebhook } from "./VerifiedTikTokWebhook.js";

export const claimTikTokWebhookReplay = async (
  webhook: VerifiedTikTokWebhook,
  protector: TikTokWebhookReplayProtector,
  ttlMilliseconds = 86_400_000,
): Promise<void> => {
  if (!Number.isSafeInteger(ttlMilliseconds) || ttlMilliseconds < 1) {
    throw new ProviderRuntimeError("tiktok", "invalid_configuration");
  }
  const wasClaimed = await protector.claim(webhook.dedupeKey, ttlMilliseconds);
  if (!wasClaimed) {
    throw new ProviderRuntimeError("tiktok", "rejected");
  }
};
