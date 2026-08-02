import type { RedisSetIfAbsentOptions } from "./RedisSetIfAbsentOptions.js";

export interface RedisSetIfAbsentCommands {
  set(
    key: string,
    value: string,
    options: RedisSetIfAbsentOptions,
  ): Promise<"OK" | null>;
}
