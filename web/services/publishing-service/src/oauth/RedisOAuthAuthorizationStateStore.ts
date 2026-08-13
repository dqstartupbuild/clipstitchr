import { OAuthAuthorizationStateError } from "../errors/OAuthAuthorizationStateError.js";
import type { RedisOAuthAuthorizationStateCommands } from "../redis/RedisOAuthAuthorizationStateCommands.js";
import type { RedisSecurityNamespace } from "../redis/RedisSecurityNamespace.js";
import { createNamespacedRedisSecurityKey } from "../redis/createNamespacedRedisSecurityKey.js";
import { createRedisSecurityNamespace } from "../redis/createRedisSecurityNamespace.js";
import type { OAuthAuthorizationStateStore } from "./OAuthAuthorizationStateStore.js";
import { isStoredOAuthStateValue } from "./isStoredOAuthStateValue.js";
import { redisCompareAndDeleteOAuthStateScript } from "./redisCompareAndDeleteOAuthStateScript.js";

const STORAGE_KEY_PATTERN = /^oauth-authorization-state:v1:[A-Za-z0-9_-]{43}$/;
const MAX_STATE_TTL_MILLISECONDS = 600_000;

export class RedisOAuthAuthorizationStateStore
  implements OAuthAuthorizationStateStore
{
  readonly #commands: RedisOAuthAuthorizationStateCommands;
  readonly #namespace: RedisSecurityNamespace;

  constructor(
    commands: RedisOAuthAuthorizationStateCommands,
    namespace: RedisSecurityNamespace,
  ) {
    if (
      commands.getDel === undefined &&
      (commands.get === undefined || commands.eval === undefined)
    ) {
      throw new OAuthAuthorizationStateError("configuration");
    }

    this.#commands = commands;
    this.#namespace = createRedisSecurityNamespace(namespace);
  }

  async create(
    storageKey: string,
    value: string,
    ttlMilliseconds: number,
  ): Promise<boolean> {
    if (
      !STORAGE_KEY_PATTERN.test(storageKey) ||
      !isStoredOAuthStateValue(value) ||
      !Number.isSafeInteger(ttlMilliseconds) ||
      ttlMilliseconds < 1 ||
      ttlMilliseconds > MAX_STATE_TTL_MILLISECONDS
    ) {
      throw new OAuthAuthorizationStateError("invalid");
    }

    try {
      const result = await this.#commands.set(
        createNamespacedRedisSecurityKey(this.#namespace, storageKey),
        value,
        {
          NX: true,
          PX: ttlMilliseconds,
        },
      );

      if (result !== "OK" && result !== null) {
        throw new OAuthAuthorizationStateError("storage");
      }

      return result === "OK";
    } catch (error) {
      if (error instanceof OAuthAuthorizationStateError) {
        throw error;
      }

      throw new OAuthAuthorizationStateError("storage");
    }
  }

  async consume(storageKey: string): Promise<string | null> {
    if (!STORAGE_KEY_PATTERN.test(storageKey)) {
      throw new OAuthAuthorizationStateError("invalid");
    }

    const namespacedStorageKey = createNamespacedRedisSecurityKey(
      this.#namespace,
      storageKey,
    );

    try {
      if (this.#commands.getDel !== undefined) {
        const value = await this.#commands.getDel(namespacedStorageKey);

        if (value !== null && !isStoredOAuthStateValue(value)) {
          throw new OAuthAuthorizationStateError("storage");
        }

        return value;
      }

      const get = this.#commands.get;
      const evaluate = this.#commands.eval;

      if (get === undefined || evaluate === undefined) {
        throw new OAuthAuthorizationStateError("configuration");
      }

      const value = await get.call(this.#commands, namespacedStorageKey);

      if (value === null) {
        return null;
      }

      if (!isStoredOAuthStateValue(value)) {
        throw new OAuthAuthorizationStateError("storage");
      }

      const deleteResult = await evaluate.call(
        this.#commands,
        redisCompareAndDeleteOAuthStateScript,
        { keys: [namespacedStorageKey], arguments: [value] },
      );

      if (
        deleteResult !== 0 &&
        deleteResult !== 1 &&
        deleteResult !== "0" &&
        deleteResult !== "1"
      ) {
        throw new OAuthAuthorizationStateError("storage");
      }

      return deleteResult === 1 || deleteResult === "1" ? value : null;
    } catch (error) {
      if (error instanceof OAuthAuthorizationStateError) {
        throw error;
      }

      throw new OAuthAuthorizationStateError("storage");
    }
  }
}
