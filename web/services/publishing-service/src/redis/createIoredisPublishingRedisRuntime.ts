import { Redis } from "ioredis";

import { PublishingRedisUnavailableError } from "../errors/PublishingRedisUnavailableError.js";
import { IoredisPublishingRedisRuntime } from "./IoredisPublishingRedisRuntime.js";

const REDIS_PROTOCOLS = new Set(["redis:", "rediss:"]);

export const createIoredisPublishingRedisRuntime = (
  redisUrl: string,
): IoredisPublishingRedisRuntime => {
  try {
    const parsedUrl = new URL(redisUrl);

    if (!REDIS_PROTOCOLS.has(parsedUrl.protocol) || parsedUrl.hostname.length === 0) {
      throw new PublishingRedisUnavailableError();
    }

    const client = new Redis(parsedUrl.toString(), {
      lazyConnect: true,
      enableOfflineQueue: false,
      enableReadyCheck: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
      reconnectOnError: () => false,
      autoResubscribe: false,
      autoResendUnfulfilledCommands: false,
      showFriendlyErrorStack: false,
      connectTimeout: 5_000,
      commandTimeout: 2_000,
    });

    client.on("error", () => undefined);
    return new IoredisPublishingRedisRuntime(client);
  } catch {
    throw new PublishingRedisUnavailableError();
  }
};
