import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { createInteractiveShellPrompts } from "../interactiveShell/createInteractiveShellPrompts.js";
import { createInteractiveShellServices } from "../interactiveShell/createInteractiveShellServices.js";
import { getInteractiveTuiIsSupported } from "../interactiveShell/getInteractiveTuiIsSupported.js";
import { readInteractiveShellContext } from "../interactiveShell/readInteractiveShellContext.js";
import { runInteractiveShell } from "../interactiveShell/runInteractiveShell.js";
import { runInteractiveTui } from "../interactiveTui/runInteractiveTui.js";

export async function runInteractiveCommand(options: CliGlobalOptions) {
  const prompts = createInteractiveShellPrompts();
  const services = createInteractiveShellServices();
  const readContext = async () => await readInteractiveShellContext(options);
  const context = await readContext();

  if (getInteractiveTuiIsSupported({ plain: options.plain })) {
    await runInteractiveTui({
      context,
      options,
      prompts,
      readContext,
      services,
    });
    return;
  }

  await runInteractiveShell({
    context,
    options,
    prompts,
    readContext,
    services,
  });
}
