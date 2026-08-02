import type { RedisEvalOptions } from "./RedisEvalOptions.js";

export interface RedisScriptCommands {
  eval(script: string, options: RedisEvalOptions): Promise<unknown>;
}
