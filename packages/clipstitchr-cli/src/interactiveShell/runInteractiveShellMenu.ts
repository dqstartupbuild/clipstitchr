import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { createInteractiveShellAccountChoices } from "./createInteractiveShellAccountChoices.js";
import { createInteractiveShellDemoChoices } from "./createInteractiveShellDemoChoices.js";
import { createInteractiveShellMainChoices } from "./createInteractiveShellMainChoices.js";
import { createInteractiveShellNativeChoices } from "./createInteractiveShellNativeChoices.js";
import { createInteractiveShellProductsChoices } from "./createInteractiveShellProductsChoices.js";
import { createInteractiveShellQueueChoices } from "./createInteractiveShellQueueChoices.js";
import { runInteractiveAccountShellAction } from "./runInteractiveAccountShellAction.js";
import { runInteractiveDemoShellAction } from "./runInteractiveDemoShellAction.js";
import { runInteractiveMainMenuAction } from "./runInteractiveMainMenuAction.js";
import { runInteractiveNativeShellAction } from "./runInteractiveNativeShellAction.js";
import { runInteractiveProductsShellAction } from "./runInteractiveProductsShellAction.js";
import { runInteractiveQueueShellAction } from "./runInteractiveQueueShellAction.js";

export async function runInteractiveShellMenu(input: {
  menu: InteractiveShellMenu;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  if (input.menu === "demo") {
    return await runInteractiveDemoShellAction({
      action: await input.prompts.select({
        choices: createInteractiveShellDemoChoices(),
        message: "What do you want to do?",
      }),
      options: input.options,
      prompts: input.prompts,
      services: input.services,
    });
  }

  if (input.menu === "products") {
    return await runInteractiveProductsShellAction({
      action: await input.prompts.select({
        choices: createInteractiveShellProductsChoices(),
        message: "What do you want to do?",
      }),
      options: input.options,
      prompts: input.prompts,
      services: input.services,
    });
  }

  if (input.menu === "queue") {
    return await runInteractiveQueueShellAction({
      action: await input.prompts.select({
        choices: createInteractiveShellQueueChoices(),
        message: "What do you want to queue?",
      }),
      options: input.options,
      prompts: input.prompts,
      services: input.services,
    });
  }

  if (input.menu === "native") {
    return await runInteractiveNativeShellAction({
      action: await input.prompts.select({
        choices: createInteractiveShellNativeChoices(),
        message: "What do you want to do?",
      }),
      options: input.options,
      prompts: input.prompts,
      services: input.services,
    });
  }

  if (input.menu === "account") {
    return await runInteractiveAccountShellAction({
      action: await input.prompts.select({
        choices: createInteractiveShellAccountChoices(),
        message: "What do you want to do?",
      }),
      options: input.options,
      prompts: input.prompts,
      services: input.services,
    });
  }

  return await runInteractiveMainMenuAction({
    action: await input.prompts.select({
      choices: createInteractiveShellMainChoices(),
      message: "What do you want to do?",
    }),
    options: input.options,
    prompts: input.prompts,
    services: input.services,
  });
}
