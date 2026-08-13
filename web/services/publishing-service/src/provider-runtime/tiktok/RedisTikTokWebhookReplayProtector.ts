import { randomBytes } from "node:crypto";

import { PublishingRedisUnavailableError } from "../../errors/PublishingRedisUnavailableError.js";
import type { RedisSetIfAbsentCommands } from "../../redis/RedisSetIfAbsentCommands.js";
import type { RedisSecurityNamespace } from "../../redis/RedisSecurityNamespace.js";
import { createNamespacedRedisSecurityKey } from "../../redis/createNamespacedRedisSecurityKey.js";
import { createRedisSecurityNamespace } from "../../redis/createRedisSecurityNamespace.js";
import type { TikTokWebhookReplayProtector } from "./TikTokWebhookReplayProtector.js";

const DEDUPE_KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_TTL_MILLISECONDS = 604_800_000;

export class RedisTikTokWebhookReplayProtector
  implements TikTokWebhookReplayProtector
{
  readonly #commands: RedisSetIfAbsentCommands;
  readonly #namespace: RedisSecurityNamespace;

  constructor(
    commands: RedisSetIfAbsentCommands,
    namespace: RedisSecurityNamespace,
  ) {
    this.#commands = commands;
    this.#namespace = createRedisSecurityNamespace(namespace);
  }

  async claim(dedupeKey: string, ttlMilliseconds: number): Promise<boolean> {
    if (
      !DEDUPE_KEY_PATTERN.test(dedupeKey) ||
      !Number.isSafeInteger(ttlMilliseconds) ||
      ttlMilliseconds < 1 ||
      ttlMilliseconds > MAX_TTL_MILLISECONDS
    ) {
      return false;
    }

    try {
      const result = await this.#commands.set(
        createNamespacedRedisSecurityKey(
          this.#namespace,
          `tiktok-webhook:v1:${dedupeKey}`,
        ),
        randomBytes(16).toString("base64url"),
        { NX: true, PX: ttlMilliseconds },
      );

      if (result !== "OK" && result !== null) {
        throw new PublishingRedisUnavailableError();
      }

      return result === "OK";
    } catch (error) {
      if (error instanceof PublishingRedisUnavailableError) {
        throw error;
      }

      throw new PublishingRedisUnavailableError();
    }
  }
}
