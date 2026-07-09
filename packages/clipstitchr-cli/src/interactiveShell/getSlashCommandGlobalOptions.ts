import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { SlashCommandOptions } from "./SlashCommandOptions.js";

export function getSlashCommandGlobalOptions(input: {
  parsed: SlashCommandOptions;
  shellOptions: CliGlobalOptions;
}): CliGlobalOptions {
  return {
    ...input.shellOptions,
    api:
      typeof input.parsed.options.api === "string"
        ? input.parsed.options.api
        : input.shellOptions.api,
    plain:
      typeof input.parsed.options.plain === "boolean"
        ? input.parsed.options.plain
        : input.shellOptions.plain,
  };
}
