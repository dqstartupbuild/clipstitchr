import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import { getSlashCommandGlobalOptions } from "./getSlashCommandGlobalOptions.js";
import { parseSlashCommandOptions } from "./parseSlashCommandOptions.js";

export async function dispatchStitchrSlashCommand(input: {
  options: CliGlobalOptions;
  services: InteractiveShellServices;
  tokens: string[];
}) {
  const [subcommand, ...tokens] = input.tokens;

  if (subcommand !== "new" && subcommand !== "batch") {
    throw new Error(`Unknown Stitchr command: ${subcommand ?? ""}.`);
  }

  const parsed = parseSlashCommandOptions({
    tokens,
    valueOptions: ["product", "sound", "template", "time-zone"],
  });

  await input.services.runStitchrNew({
    ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
    ...parsed.options,
  });
  return { menu: "main" as const };
}
