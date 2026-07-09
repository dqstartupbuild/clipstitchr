import { select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { createProductsMenuChoices } from "./createProductsMenuChoices.js";
import { createProductsMenuServices } from "./createProductsMenuServices.js";
import { runProductsMenuAction } from "./runProductsMenuAction.js";

export async function runProductsMenuCommand(options: CliGlobalOptions) {
  logBrandHeader("Products");

  await runProductsMenuAction({
    action: await select({
      choices: createProductsMenuChoices(),
      message: "What do you want to do?",
    }),
    options,
    services: createProductsMenuServices(),
  });
}
