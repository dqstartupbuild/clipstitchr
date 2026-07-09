import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellNotice } from "./InteractiveShellNotice.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import { getInteractiveShellMenuTitle } from "./getInteractiveShellMenuTitle.js";
import { getIsInteractivePromptCancelError } from "./getIsInteractivePromptCancelError.js";
import { logInteractiveShellMenuHeader } from "./logInteractiveShellMenuHeader.js";
import { runInteractiveShellMenu } from "./runInteractiveShellMenu.js";

export async function runInteractiveShell(input: {
  initialMenu?: InteractiveShellMenu;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}) {
  let currentMenu = input.initialMenu ?? "main";
  let notice: InteractiveShellNotice | undefined;

  try {
    while (true) {
      logInteractiveShellMenuHeader({
        menu: currentMenu,
        notice,
        options: input.options,
      });

      const transition = await runInteractiveShellMenu({
        menu: currentMenu,
        options: input.options,
        prompts: input.prompts,
        services: input.services,
      });

      if (transition.exit) {
        return;
      }

      notice =
        transition.notice ??
        (transition.menu === currentMenu
          ? undefined
          : {
              kind: "info",
              message: `Opened ${getInteractiveShellMenuTitle(transition.menu)}.`,
            });
      currentMenu = transition.menu;
    }
  } catch (error) {
    if (getIsInteractivePromptCancelError(error)) {
      console.log("");
      return;
    }

    throw error;
  }
}
