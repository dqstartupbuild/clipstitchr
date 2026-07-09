import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { getInteractiveShellNavigationTransition } from "./getInteractiveShellNavigationTransition.js";
import { getIsInteractiveShellNavigationAction } from "./getIsInteractiveShellNavigationAction.js";
import type { InteractiveShellAccountAction } from "./InteractiveShellAccountAction.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { runInteractiveShellActionWithRecovery } from "./runInteractiveShellActionWithRecovery.js";
import { runInteractiveShellSlashCommand } from "./runInteractiveShellSlashCommand.js";

export async function runInteractiveAccountShellAction(input: {
  action: InteractiveShellAccountAction;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  if (getIsInteractiveShellNavigationAction(input.action)) {
    if (input.action === "nav:slash") {
      return await runInteractiveShellActionWithRecovery({
        backMenu: "main",
        currentMenu: "account",
        prompts: input.prompts,
        run: async () =>
          await runInteractiveShellSlashCommand({
            currentMenu: "account",
            options: input.options,
            prompts: input.prompts,
            services: input.services,
          }),
      });
    }

    return getInteractiveShellNavigationTransition({
      action: input.action,
      backMenu: "main",
      currentMenu: "account",
    });
  }

  if (input.action === "native") {
    return { menu: "native" };
  }

  return await runInteractiveShellActionWithRecovery({
    backMenu: "main",
    currentMenu: "account",
    prompts: input.prompts,
    run: async () => {
      if (input.action === "link") {
        await input.services.runLink(input.options);
      } else if (input.action === "login") {
        await input.services.runLogin(input.options);
      } else if (input.action === "logout") {
        await input.services.runLogout();
      } else if (input.action === "unlink") {
        await input.services.runUnlink();
      } else if (input.action === "doctor") {
        await input.services.runDoctor();
      } else if (input.action === "update") {
        await input.services.runUpdate();
      } else {
        await input.services.runStatus();
      }

      return { menu: "account" };
    },
  });
}
