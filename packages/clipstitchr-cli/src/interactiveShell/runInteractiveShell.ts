import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { clipstitchrCliDescription } from "../config/clipstitchrCliDescription.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import { getInteractiveShellMenuTitle } from "./getInteractiveShellMenuTitle.js";
import { getIsInteractivePromptCancelError } from "./getIsInteractivePromptCancelError.js";
import { runInteractiveShellMenu } from "./runInteractiveShellMenu.js";

export async function runInteractiveShell(input: {
  initialMenu?: InteractiveShellMenu;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}) {
  let currentMenu = input.initialMenu ?? "main";

  try {
    while (true) {
      logBrandHeader(
        currentMenu === "main"
          ? clipstitchrCliDescription
          : getInteractiveShellMenuTitle(currentMenu),
      );

      const transition = await runInteractiveShellMenu({
        menu: currentMenu,
        options: input.options,
        prompts: input.prompts,
        services: input.services,
      });

      if (transition.exit) {
        return;
      }

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
