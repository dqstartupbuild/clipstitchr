import { logError } from "../terminal/logError.js";
import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { createInteractiveShellErrorRecoveryChoices } from "./createInteractiveShellErrorRecoveryChoices.js";

export async function runInteractiveShellActionWithRecovery(input: {
  backMenu: InteractiveShellMenu;
  currentMenu: InteractiveShellMenu;
  prompts: InteractiveShellPrompts;
  run: () => Promise<InteractiveShellTransition>;
}): Promise<InteractiveShellTransition> {
  while (true) {
    try {
      return await input.run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logError(message);

      const recoveryAction = await input.prompts.select({
        choices: createInteractiveShellErrorRecoveryChoices(),
        message: "What should happen next?",
      });

      if (recoveryAction === "retry") {
        continue;
      }

      if (recoveryAction === "back") {
        return { menu: input.backMenu };
      }

      if (recoveryAction === "main") {
        return { menu: "main" };
      }

      return { exit: true, menu: input.currentMenu };
    }
  }
}
