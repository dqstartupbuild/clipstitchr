import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { ProductsMenuAction } from "../productsMenu/ProductsMenuAction.js";
import { runProductsMenuAction } from "../productsMenu/runProductsMenuAction.js";
import { getInteractiveShellNavigationTransition } from "./getInteractiveShellNavigationTransition.js";
import { getIsInteractiveShellNavigationAction } from "./getIsInteractiveShellNavigationAction.js";
import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { runInteractiveShellActionWithRecovery } from "./runInteractiveShellActionWithRecovery.js";
import { runInteractiveShellSlashCommand } from "./runInteractiveShellSlashCommand.js";

export async function runInteractiveProductsShellAction(input: {
  action: ProductsMenuAction | InteractiveShellNavigationAction;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  const action = input.action;

  if (getIsInteractiveShellNavigationAction(action)) {
    if (action === "nav:slash") {
      return await runInteractiveShellActionWithRecovery({
        backMenu: "main",
        currentMenu: "products",
        prompts: input.prompts,
        run: async () =>
          await runInteractiveShellSlashCommand({
            currentMenu: "products",
            options: input.options,
            prompts: input.prompts,
            services: input.services,
          }),
      });
    }

    return getInteractiveShellNavigationTransition({
      action,
      backMenu: "main",
      currentMenu: "products",
    });
  }

  return await runInteractiveShellActionWithRecovery({
    backMenu: "main",
    currentMenu: "products",
    prompts: input.prompts,
    run: async () => {
      await runProductsMenuAction({
        action,
        options: input.options,
        services: input.services.products,
      });
      return { menu: "products" };
    },
  });
}
