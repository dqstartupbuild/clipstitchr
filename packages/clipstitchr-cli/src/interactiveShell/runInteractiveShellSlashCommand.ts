import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { dispatchSlashCommand } from "./dispatchSlashCommand.js";

export async function runInteractiveShellSlashCommand(input: {
  currentMenu: InteractiveShellMenu;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  return await dispatchSlashCommand({
    commandLine: await input.prompts.slashCommand("Slash command:"),
    currentMenu: input.currentMenu,
    options: input.options,
    services: input.services,
  });
}
