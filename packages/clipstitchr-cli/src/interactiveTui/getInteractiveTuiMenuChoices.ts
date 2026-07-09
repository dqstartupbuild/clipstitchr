import { createInteractiveShellAccountChoices } from "../interactiveShell/createInteractiveShellAccountChoices.js";
import { createInteractiveShellDemoChoices } from "../interactiveShell/createInteractiveShellDemoChoices.js";
import { createInteractiveShellMainChoices } from "../interactiveShell/createInteractiveShellMainChoices.js";
import { createInteractiveShellNativeChoices } from "../interactiveShell/createInteractiveShellNativeChoices.js";
import { createInteractiveShellProductsChoices } from "../interactiveShell/createInteractiveShellProductsChoices.js";
import { createInteractiveShellQueueChoices } from "../interactiveShell/createInteractiveShellQueueChoices.js";
import type { InteractiveShellChoice } from "../interactiveShell/InteractiveShellChoice.js";
import type { InteractiveShellContext } from "../interactiveShell/InteractiveShellContext.js";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import { createInteractiveTuiResultChoices } from "./createInteractiveTuiResultChoices.js";

export function getInteractiveTuiMenuChoices(
  menu: InteractiveShellMenu,
  context?: InteractiveShellContext,
  view: "menu" | "result" = "menu",
): InteractiveShellChoice<string>[] {
  if (view === "result") {
    return createInteractiveTuiResultChoices(menu);
  }

  if (menu === "demo") {
    return createInteractiveShellDemoChoices();
  }

  if (menu === "products") {
    return createInteractiveShellProductsChoices();
  }

  if (menu === "queue") {
    return createInteractiveShellQueueChoices();
  }

  if (menu === "native") {
    return createInteractiveShellNativeChoices();
  }

  if (menu === "account") {
    return createInteractiveShellAccountChoices(context);
  }

  return createInteractiveShellMainChoices({
    context,
    includeSlashCommand: false,
  });
}
