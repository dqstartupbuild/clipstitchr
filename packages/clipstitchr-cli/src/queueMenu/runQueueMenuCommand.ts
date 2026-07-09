import { input, select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { createQueueMenuChoices } from "./createQueueMenuChoices.js";
import { createQueueMenuServices } from "./createQueueMenuServices.js";
import { runQueueMenuAction } from "./runQueueMenuAction.js";

export async function runQueueMenuCommand(options: CliGlobalOptions) {
  logBrandHeader("Queue");

  await runQueueMenuAction({
    action: await select({
      choices: createQueueMenuChoices(),
      message: "What do you want to queue?",
    }),
    options,
    readText: (message) => input({ message }),
    services: createQueueMenuServices(),
  });
}
