import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import { parseSlashCommandOptions } from "./parseSlashCommandOptions.js";

export async function dispatchNativeSlashCommand(input: {
  _options: CliGlobalOptions;
  services: InteractiveShellServices;
  tokens: string[];
}) {
  const [subcommand, ...tokens] = input.tokens;

  if (!subcommand) {
    return { menu: "native" as const };
  }

  if (subcommand === "init") {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["force"],
      tokens,
    });

    await input.services.runNativeInit(parsed.options);
    return { menu: "native" as const };
  }

  if (subcommand === "check") {
    parseSlashCommandOptions({ tokens });
    await input.services.runNativeCheck();
    return { menu: "native" as const };
  }

  throw new Error(`Unknown native command: ${subcommand}.`);
}
