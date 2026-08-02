import type { Redis } from "ioredis";

import { PublishingRedisUnavailableError } from "../errors/PublishingRedisUnavailableError.js";
import type { RedisEvalOptions } from "./RedisEvalOptions.js";
import type { RedisOAuthAuthorizationStateCommands } from "./RedisOAuthAuthorizationStateCommands.js";
import type { RedisScriptCommands } from "./RedisScriptCommands.js";
import type { RedisSetIfAbsentOptions } from "./RedisSetIfAbsentOptions.js";

export class IoredisPublishingSecurityCommands
  implements RedisOAuthAuthorizationStateCommands, RedisScriptCommands
{
  readonly #client: Redis;

  constructor(client: Redis) {
    this.#client = client;
  }

  async set(
    key: string,
    value: string,
    options: RedisSetIfAbsentOptions,
  ): Promise<"OK" | null> {
    this.#assertConnected();

    try {
      return await this.#client.set(key, value, "PX", options.PX, "NX");
    } catch {
      throw new PublishingRedisUnavailableError();
    }
  }

  async get(key: string): Promise<string | null> {
    this.#assertConnected();

    try {
      return await this.#client.get(key);
    } catch {
      throw new PublishingRedisUnavailableError();
    }
  }

  async getDel(key: string): Promise<string | null> {
    this.#assertConnected();

    try {
      return await this.#client.getdel(key);
    } catch {
      throw new PublishingRedisUnavailableError();
    }
  }

  async eval(script: string, options: RedisEvalOptions): Promise<unknown> {
    this.#assertConnected();

    try {
      return await this.#client.eval(
        script,
        options.keys.length,
        ...options.keys,
        ...options.arguments,
      );
    } catch {
      throw new PublishingRedisUnavailableError();
    }
  }

  #assertConnected(): void {
    if (this.#client.status !== "ready") {
      throw new PublishingRedisUnavailableError();
    }
  }
}
