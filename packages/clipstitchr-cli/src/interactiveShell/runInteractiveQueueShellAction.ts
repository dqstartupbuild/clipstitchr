import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { QueueMenuAction } from "../queueMenu/QueueMenuAction.js";
import { runQueueMenuAction } from "../queueMenu/runQueueMenuAction.js";
import { getInteractiveShellNavigationTransition } from "./getInteractiveShellNavigationTransition.js";
import { getIsInteractiveShellNavigationAction } from "./getIsInteractiveShellNavigationAction.js";
import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { runInteractiveShellActionWithRecovery } from "./runInteractiveShellActionWithRecovery.js";
import { runInteractiveShellSlashCommand } from "./runInteractiveShellSlashCommand.js";

export async function runInteractiveQueueShellAction(input: {
  action: QueueMenuAction | InteractiveShellNavigationAction;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  const action = input.action;

  if (getIsInteractiveShellNavigationAction(action)) {
    if (action === "nav:slash") {
      return await runInteractiveShellActionWithRecovery({
        backMenu: "main",
        currentMenu: "queue",
        prompts: input.prompts,
        run: async () =>
          await runInteractiveShellSlashCommand({
            currentMenu: "queue",
            options: input.options,
            prompts: input.prompts,
            services: input.services,
          }),
      });
    }

    return getInteractiveShellNavigationTransition({
      action,
      backMenu: "main",
      currentMenu: "queue",
    });
  }

  return await runInteractiveShellActionWithRecovery({
    backMenu: "main",
    currentMenu: "queue",
    prompts: input.prompts,
    run: async () => {
      await runQueueMenuAction({
        action,
        options: input.options,
        readText: input.prompts.input,
        services: input.services.queue,
      });
      return { menu: "queue" };
    },
  });
}
