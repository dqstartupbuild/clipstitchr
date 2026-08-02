import type { RedisSetIfAbsentCommands } from "./RedisSetIfAbsentCommands.js";
import type { RedisEvalOptions } from "./RedisEvalOptions.js";

export interface RedisOAuthAuthorizationStateCommands
  extends RedisSetIfAbsentCommands {
  get?(key: string): Promise<string | null>;
  getDel?(key: string): Promise<string | null>;
  eval?(script: string, options: RedisEvalOptions): Promise<unknown>;
}
