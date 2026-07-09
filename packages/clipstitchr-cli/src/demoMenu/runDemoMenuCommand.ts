import { input, select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { createDemoMenuChoices } from "./createDemoMenuChoices.js";
import { createDemoMenuServices } from "./createDemoMenuServices.js";
import { runDemoMenuAction } from "./runDemoMenuAction.js";

export async function runDemoMenuCommand(options: CliGlobalOptions) {
  logBrandHeader("Demo");

  await runDemoMenuAction({
    action: await select({
      choices: createDemoMenuChoices(),
      message: "What do you want to do?",
    }),
    options,
    readText: (message) => input({ message }),
    services: createDemoMenuServices(),
  });
}
