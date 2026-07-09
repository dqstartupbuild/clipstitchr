import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";

export function getInteractiveShellNavigationTransition(input: {
  action: InteractiveShellNavigationAction;
  backMenu: InteractiveShellMenu;
  currentMenu: InteractiveShellMenu;
}): InteractiveShellTransition {
  if (input.action === "nav:back") {
    return { menu: input.backMenu };
  }

  if (input.action === "nav:main") {
    return { menu: "main" };
  }

  if (input.action === "nav:exit") {
    return { exit: true, menu: input.currentMenu };
  }

  return { menu: input.currentMenu };
}
