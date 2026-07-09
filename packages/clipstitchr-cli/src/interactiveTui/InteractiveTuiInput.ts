import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import type { InteractiveShellContext } from "../interactiveShell/InteractiveShellContext.js";
import type { InteractiveShellPrompts } from "../interactiveShell/InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "../interactiveShell/InteractiveShellServices.js";

export type InteractiveTuiInput = {
  context?: InteractiveShellContext;
  initialMenu?: InteractiveShellMenu;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  readContext?: () => Promise<InteractiveShellContext>;
  services: InteractiveShellServices;
};
