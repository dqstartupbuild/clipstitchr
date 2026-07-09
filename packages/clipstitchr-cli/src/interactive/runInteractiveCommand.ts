import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { createInteractiveShellPrompts } from "../interactiveShell/createInteractiveShellPrompts.js";
import { createInteractiveShellServices } from "../interactiveShell/createInteractiveShellServices.js";
import { runInteractiveShell } from "../interactiveShell/runInteractiveShell.js";

export async function runInteractiveCommand(options: CliGlobalOptions) {
  await runInteractiveShell({
    options,
    prompts: createInteractiveShellPrompts(),
    services: createInteractiveShellServices(),
  });
}
