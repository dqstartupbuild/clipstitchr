import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellMainAction } from "./InteractiveShellMainAction.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { runInteractiveShellActionWithRecovery } from "./runInteractiveShellActionWithRecovery.js";
import { runInteractiveShellSlashCommand } from "./runInteractiveShellSlashCommand.js";

export async function runInteractiveMainMenuAction(input: {
  action: InteractiveShellMainAction;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  if (
    input.action === "demo" ||
    input.action === "products" ||
    input.action === "queue" ||
    input.action === "native" ||
    input.action === "account"
  ) {
    return { menu: input.action };
  }

  if (input.action === "nav:exit") {
    return { exit: true, menu: "main" };
  }

  if (input.action === "nav:slash") {
    return await runInteractiveShellActionWithRecovery({
      backMenu: "main",
      currentMenu: "main",
      prompts: input.prompts,
      run: async () =>
        await runInteractiveShellSlashCommand({
          currentMenu: "main",
          options: input.options,
          prompts: input.prompts,
          services: input.services,
        }),
    });
  }

  return await runInteractiveShellActionWithRecovery({
    backMenu: "main",
    currentMenu: "main",
    prompts: input.prompts,
    run: async () => {
      if (input.action === "stitchr-new") {
        await input.services.runStitchrNew(input.options);
      } else if (input.action === "swipr-new") {
        await input.services.runSwiprNew(input.options);
      } else if (input.action === "link") {
        await input.services.runLink(input.options);
      } else if (input.action === "login") {
        await input.services.runLogin(input.options);
      } else if (input.action === "status") {
        await input.services.runStatus();
      } else if (input.action === "doctor") {
        await input.services.runDoctor();
      } else {
        await input.services.runUpdate();
      }

      return { menu: "main" };
    },
  });
}
