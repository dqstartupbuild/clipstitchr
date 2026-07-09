import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import { getSlashCommandGlobalOptions } from "./getSlashCommandGlobalOptions.js";
import { parseSlashCommandOptions } from "./parseSlashCommandOptions.js";

export async function dispatchProductsSlashCommand(input: {
  options: CliGlobalOptions;
  services: InteractiveShellServices;
  tokens: string[];
}) {
  const [subcommand, ...tokens] = input.tokens;

  if (!subcommand) {
    return { menu: "products" as const };
  }

  if (subcommand === "list") {
    const parsed = parseSlashCommandOptions({ tokens });

    await input.services.runProductsList(
      getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
    );
    return { menu: "products" as const };
  }

  if (subcommand === "create") {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["use"],
      tokens,
    });

    await input.services.runProductsCreate({
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "products" as const };
  }

  if (subcommand === "use") {
    const parsed = parseSlashCommandOptions({ tokens });

    await input.services.runProductsUse(
      parsed.positionals[0],
      getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
    );
    return { menu: "products" as const };
  }

  throw new Error(`Unknown products command: ${subcommand}.`);
}
