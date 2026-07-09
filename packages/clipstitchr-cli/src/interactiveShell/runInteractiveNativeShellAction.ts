import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { getInteractiveShellNavigationTransition } from "./getInteractiveShellNavigationTransition.js";
import { getIsInteractiveShellNavigationAction } from "./getIsInteractiveShellNavigationAction.js";
import type { InteractiveShellNativeAction } from "./InteractiveShellNativeAction.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { runInteractiveShellActionWithRecovery } from "./runInteractiveShellActionWithRecovery.js";
import { runInteractiveShellSlashCommand } from "./runInteractiveShellSlashCommand.js";

export async function runInteractiveNativeShellAction(input: {
  action: InteractiveShellNativeAction;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  if (getIsInteractiveShellNavigationAction(input.action)) {
    if (input.action === "nav:slash") {
      return await runInteractiveShellActionWithRecovery({
        backMenu: "main",
        currentMenu: "native",
        prompts: input.prompts,
        run: async () =>
          await runInteractiveShellSlashCommand({
            currentMenu: "native",
            options: input.options,
            prompts: input.prompts,
            services: input.services,
          }),
      });
    }

    return getInteractiveShellNavigationTransition({
      action: input.action,
      backMenu: "main",
      currentMenu: "native",
    });
  }

  return await runInteractiveShellActionWithRecovery({
    backMenu: "main",
    currentMenu: "native",
    prompts: input.prompts,
    run: async () => {
      if (input.action === "native-init") {
        await input.services.runNativeInit();
      } else {
        await input.services.runNativeCheck();
      }

      return { menu: "native" };
    },
  });
}
