import { PublishingRedisUnavailableError } from "../errors/PublishingRedisUnavailableError.js";
import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import type { CreateTikTokWebhookHttpHandlerOptions } from "./CreateTikTokWebhookHttpHandlerOptions.js";

const THREE_DAYS_IN_MILLISECONDS = 259_200_000;

export const claimTikTokWebhookDelivery = async (
  dedupeKey: string,
  replayProtector: CreateTikTokWebhookHttpHandlerOptions["replayProtector"],
): Promise<boolean> => {
  try {
    return await replayProtector.claim(
      dedupeKey,
      THREE_DAYS_IN_MILLISECONDS,
    );
  } catch (error) {
    if (error instanceof PublishingRedisUnavailableError) {
      throw new PublishingServiceHttpError(
        503,
        "webhook_protection_unavailable",
      );
    }
    throw error;
  }
};
