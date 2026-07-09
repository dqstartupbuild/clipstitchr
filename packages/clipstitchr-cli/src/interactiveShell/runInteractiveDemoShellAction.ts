import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { DemoMenuAction } from "../demoMenu/DemoMenuAction.js";
import { runDemoMenuAction } from "../demoMenu/runDemoMenuAction.js";
import { getInteractiveShellNavigationTransition } from "./getInteractiveShellNavigationTransition.js";
import { getIsInteractiveShellNavigationAction } from "./getIsInteractiveShellNavigationAction.js";
import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { runInteractiveShellActionWithRecovery } from "./runInteractiveShellActionWithRecovery.js";
import { runInteractiveShellSlashCommand } from "./runInteractiveShellSlashCommand.js";

export async function runInteractiveDemoShellAction(input: {
  action: DemoMenuAction | InteractiveShellNavigationAction;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  const action = input.action;

  if (getIsInteractiveShellNavigationAction(action)) {
    if (action === "nav:slash") {
      return await runInteractiveShellActionWithRecovery({
        backMenu: "main",
        currentMenu: "demo",
        prompts: input.prompts,
        run: async () =>
          await runInteractiveShellSlashCommand({
            currentMenu: "demo",
            options: input.options,
            prompts: input.prompts,
            services: input.services,
          }),
      });
    }

    return getInteractiveShellNavigationTransition({
      action,
      backMenu: "main",
      currentMenu: "demo",
    });
  }

  return await runInteractiveShellActionWithRecovery({
    backMenu: "main",
    currentMenu: "demo",
    prompts: input.prompts,
    run: async () => {
      await runDemoMenuAction({
        action,
        options: input.options,
        readText: input.prompts.input,
        services: input.services.demo,
      });
      return { menu: "demo" };
    },
  });
}
