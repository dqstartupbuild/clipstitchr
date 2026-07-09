import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import { getSlashCommandGlobalOptions } from "./getSlashCommandGlobalOptions.js";
import { parseSlashCommandOptions } from "./parseSlashCommandOptions.js";

export async function dispatchSwiprSlashCommand(input: {
  options: CliGlobalOptions;
  services: InteractiveShellServices;
  tokens: string[];
}) {
  const [subcommand, ...tokens] = input.tokens;

  if (subcommand !== "new" && subcommand !== "batch") {
    throw new Error(`Unknown Swipr command: ${subcommand ?? ""}.`);
  }

  const parsed = parseSlashCommandOptions({
    tokens,
    valueOptions: ["product"],
  });

  await input.services.runSwiprNew({
    ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
    ...parsed.options,
  });
  return { menu: "main" as const };
}
