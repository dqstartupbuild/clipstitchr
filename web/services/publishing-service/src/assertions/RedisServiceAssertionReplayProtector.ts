import { randomBytes } from "node:crypto";

import { ServiceAssertionReplayProtectionError } from "../errors/ServiceAssertionReplayProtectionError.js";
import type { RedisSetIfAbsentCommands } from "../redis/RedisSetIfAbsentCommands.js";
import type { RedisSecurityNamespace } from "../redis/RedisSecurityNamespace.js";
import { createNamespacedRedisSecurityKey } from "../redis/createNamespacedRedisSecurityKey.js";
import { createRedisSecurityNamespace } from "../redis/createRedisSecurityNamespace.js";
import type { ServiceAssertionReplayProtector } from "./ServiceAssertionReplayProtector.js";

const REPLAY_KEY_PATTERN = /^service-assertion:v1:[A-Za-z0-9_-]{43}$/;
const MAX_REPLAY_TTL_MILLISECONDS = 300_000;

export class RedisServiceAssertionReplayProtector
  implements ServiceAssertionReplayProtector
{
  readonly #commands: RedisSetIfAbsentCommands;
  readonly #namespace: RedisSecurityNamespace;
  readonly #now: () => number;

  constructor(
    commands: RedisSetIfAbsentCommands,
    namespace: RedisSecurityNamespace,
    now: () => number = Date.now,
  ) {
    this.#commands = commands;
    this.#namespace = createRedisSecurityNamespace(namespace);
    this.#now = now;
  }

  async consume(
    replayKey: string,
    expiresAtEpochMilliseconds: number,
  ): Promise<boolean> {
    const ttlMilliseconds = Math.ceil(expiresAtEpochMilliseconds - this.#now());

    if (
      !REPLAY_KEY_PATTERN.test(replayKey) ||
      !Number.isSafeInteger(expiresAtEpochMilliseconds) ||
      !Number.isSafeInteger(ttlMilliseconds) ||
      ttlMilliseconds < 1 ||
      ttlMilliseconds > MAX_REPLAY_TTL_MILLISECONDS
    ) {
      return false;
    }

    try {
      const result = await this.#commands.set(
        createNamespacedRedisSecurityKey(this.#namespace, replayKey),
        randomBytes(16).toString("base64url"),
        { NX: true, PX: ttlMilliseconds },
      );

      if (result !== "OK" && result !== null) {
        throw new ServiceAssertionReplayProtectionError();
      }

      return result === "OK";
    } catch (error) {
      if (error instanceof ServiceAssertionReplayProtectionError) {
        throw error;
      }

      throw new ServiceAssertionReplayProtectionError();
    }
  }
}
