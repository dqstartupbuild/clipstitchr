import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { createInteractiveShellPrompts } from "../interactiveShell/createInteractiveShellPrompts.js";
import { createInteractiveShellServices } from "../interactiveShell/createInteractiveShellServices.js";
import { getInteractiveTuiIsSupported } from "../interactiveShell/getInteractiveTuiIsSupported.js";
import { runInteractiveShell } from "../interactiveShell/runInteractiveShell.js";
import { runInteractiveTui } from "../interactiveTui/runInteractiveTui.js";

export async function runInteractiveCommand(options: CliGlobalOptions) {
  const prompts = createInteractiveShellPrompts();
  const services = createInteractiveShellServices();

  if (getInteractiveTuiIsSupported({ plain: options.plain })) {
    await runInteractiveTui({
      options,
      prompts,
      services,
    });
    return;
  }

  await runInteractiveShell({
    options,
    prompts,
    services,
  });
}
