import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import type { InteractiveShellPrompts } from "../interactiveShell/InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "../interactiveShell/InteractiveShellServices.js";

export type InteractiveTuiInput = {
  initialMenu?: InteractiveShellMenu;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
};
