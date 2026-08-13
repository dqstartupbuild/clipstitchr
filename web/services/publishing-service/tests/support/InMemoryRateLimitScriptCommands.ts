import type { RedisScriptCommands } from "../../src/redis/RedisScriptCommands.js";

type Counter = Readonly<{ bucket: number; count: number }>;

export class InMemoryRateLimitScriptCommands implements RedisScriptCommands {
  readonly evalCalls: Array<
    Readonly<{
      script: string;
      keys: readonly string[];
      arguments: readonly string[];
    }>
  > = [];
  readonly #counters = new Map<string, Counter>();
  #nowEpochMilliseconds: number;

  constructor(nowEpochMilliseconds: number) {
    this.#nowEpochMilliseconds = nowEpochMilliseconds;
  }

  async eval(
    script: string,
    options: Readonly<{
      keys: readonly string[];
      arguments: readonly string[];
    }>,
  ): Promise<unknown> {
    this.evalCalls.push({ script, ...options });
    const [globalKey, tenantKey] = options.keys;
    const [
      encodedGlobalLimit,
      encodedGlobalWindow,
      encodedTenantLimit,
      encodedTenantWindow,
      encodedCost,
    ] = options.arguments;

    if (
      globalKey === undefined ||
      tenantKey === undefined ||
      encodedGlobalLimit === undefined ||
      encodedGlobalWindow === undefined ||
      encodedTenantLimit === undefined ||
      encodedTenantWindow === undefined ||
      encodedCost === undefined
    ) {
      throw new Error("Invalid test command.");
    }

    const globalLimit = Number(encodedGlobalLimit);
    const globalWindow = Number(encodedGlobalWindow);
    const tenantLimit = Number(encodedTenantLimit);
    const tenantWindow = Number(encodedTenantWindow);
    const cost = Number(encodedCost);
    const globalBucket = Math.floor(this.#nowEpochMilliseconds / globalWindow);
    const tenantBucket = Math.floor(this.#nowEpochMilliseconds / tenantWindow);
    const globalCounter = this.#readCounter(globalKey, globalBucket);
    const tenantCounter = this.#readCounter(tenantKey, tenantBucket);
    const nextGlobalCount = globalCounter + cost;
    const nextTenantCount = tenantCounter + cost;
    const allowed =
      nextGlobalCount <= globalLimit && nextTenantCount <= tenantLimit;

    if (allowed) {
      this.#counters.set(globalKey, { bucket: globalBucket, count: nextGlobalCount });
      this.#counters.set(tenantKey, { bucket: tenantBucket, count: nextTenantCount });
    }

    const effectiveGlobalCount = allowed ? nextGlobalCount : globalCounter;
    const effectiveTenantCount = allowed ? nextTenantCount : tenantCounter;

    return [
      allowed ? 1 : 0,
      this.#nowEpochMilliseconds,
      Math.max(0, globalLimit - effectiveGlobalCount),
      (globalBucket + 1) * globalWindow,
      Math.max(0, tenantLimit - effectiveTenantCount),
      (tenantBucket + 1) * tenantWindow,
    ];
  }

  setNow(nowEpochMilliseconds: number): void {
    this.#nowEpochMilliseconds = nowEpochMilliseconds;
  }

  #readCounter(key: string, bucket: number): number {
    const counter = this.#counters.get(key);
    return counter?.bucket === bucket ? counter.count : 0;
  }
}
