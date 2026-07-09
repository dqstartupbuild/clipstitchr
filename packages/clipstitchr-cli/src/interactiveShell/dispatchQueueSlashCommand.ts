import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import { getSlashCommandGlobalOptions } from "./getSlashCommandGlobalOptions.js";
import { parseSlashCommandOptions } from "./parseSlashCommandOptions.js";

export async function dispatchQueueSlashCommand(input: {
  options: CliGlobalOptions;
  services: InteractiveShellServices;
  tokens: string[];
}) {
  const [subcommand, ...tokens] = input.tokens;

  if (!subcommand) {
    return { menu: "queue" as const };
  }

  if (subcommand.startsWith("--")) {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["all"],
      tokens: input.tokens,
      valueOptions: ["accounts", "product"],
    });

    if (!parsed.options.all) {
      throw new Error("Choose queue list, queue stitch, queue swipe, or --all.");
    }

    await input.services.runQueueAll({
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "queue" as const };
  }

  if (subcommand === "list") {
    const parsed = parseSlashCommandOptions({ tokens });

    await input.services.runQueueList(
      getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
    );
    return { menu: "queue" as const };
  }

  if (subcommand === "stitch" || subcommand === "swipe") {
    const parsed = parseSlashCommandOptions({
      booleanOptions: ["all"],
      tokens,
      valueOptions: ["accounts", "caption", "product", "title"],
    });
    const options = {
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    };

    if (subcommand === "stitch") {
      await input.services.runQueueStitch(parsed.positionals[0], options);
    } else {
      await input.services.runQueueSwipe(parsed.positionals[0], options);
    }

    return { menu: "queue" as const };
  }

  if (subcommand === "all") {
    const parsed = parseSlashCommandOptions({
      tokens,
      valueOptions: ["accounts", "product"],
    });

    await input.services.runQueueAll({
      ...getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
      ...parsed.options,
    });
    return { menu: "queue" as const };
  }

  throw new Error(`Unknown queue command: ${subcommand}.`);
}
