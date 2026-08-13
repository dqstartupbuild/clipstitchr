import type { RedisOAuthAuthorizationStateCommands } from "../../src/redis/RedisOAuthAuthorizationStateCommands.js";
import type { RedisSetIfAbsentOptions } from "../../src/redis/RedisSetIfAbsentOptions.js";
import type { RedisEvalOptions } from "../../src/redis/RedisEvalOptions.js";

type StoredValue = Readonly<{
  value: string;
  expiresAtEpochMilliseconds: number;
}>;

export class InMemoryRedisStringCommands
  implements RedisOAuthAuthorizationStateCommands
{
  readonly setCalls: Array<
    Readonly<{ key: string; value: string; options: RedisSetIfAbsentOptions }>
  > = [];
  readonly evalCalls: Array<Readonly<{ script: string; options: RedisEvalOptions }>> =
    [];
  readonly #values = new Map<string, StoredValue>();
  readonly #now: () => number;

  constructor(now: () => number) {
    this.#now = now;
  }

  async set(
    key: string,
    value: string,
    options: RedisSetIfAbsentOptions,
  ): Promise<"OK" | null> {
    this.setCalls.push({ key, value, options });
    this.#deleteIfExpired(key);

    if (this.#values.has(key)) {
      return null;
    }

    this.#values.set(key, {
      value,
      expiresAtEpochMilliseconds: this.#now() + options.PX,
    });
    return "OK";
  }

  async get(key: string): Promise<string | null> {
    this.#deleteIfExpired(key);
    return this.#values.get(key)?.value ?? null;
  }

  async getDel(key: string): Promise<string | null> {
    this.#deleteIfExpired(key);
    const value = this.#values.get(key)?.value ?? null;
    this.#values.delete(key);
    return value;
  }

  async atomicCompareAndDelete(
    key: string,
    expectedValue: string,
  ): Promise<boolean> {
    this.#deleteIfExpired(key);

    if (this.#values.get(key)?.value !== expectedValue) {
      return false;
    }

    this.#values.delete(key);
    return true;
  }

  async eval(script: string, options: RedisEvalOptions): Promise<unknown> {
    this.evalCalls.push({ script, options });
    const key = options.keys[0];
    const expectedValue = options.arguments[0];

    if (key === undefined || expectedValue === undefined) {
      throw new TypeError("Invalid compare-and-delete test command.");
    }

    return (await this.atomicCompareAndDelete(key, expectedValue)) ? 1 : 0;
  }

  #deleteIfExpired(key: string): void {
    const storedValue = this.#values.get(key);

    if (
      storedValue !== undefined &&
      storedValue.expiresAtEpochMilliseconds <= this.#now()
    ) {
      this.#values.delete(key);
    }
  }
}
