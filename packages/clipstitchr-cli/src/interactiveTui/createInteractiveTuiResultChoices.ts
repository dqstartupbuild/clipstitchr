import { getInteractiveShellMenuTitle } from "../interactiveShell/getInteractiveShellMenuTitle.js";
import type { InteractiveShellChoice } from "../interactiveShell/InteractiveShellChoice.js";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import type { InteractiveTuiResultAction } from "./InteractiveTuiResultAction.js";

export function createInteractiveTuiResultChoices(
  menu: InteractiveShellMenu,
): InteractiveShellChoice<InteractiveTuiResultAction>[] {
  return [
    {
      name: `Back to ${getInteractiveShellMenuTitle(menu)}`,
      value: "result:back",
    },
    ...(menu === "main"
      ? []
      : [{ name: "Main menu", value: "nav:main" as const }]),
    {
      name: "Type a slash command",
      value: "nav:slash",
    },
    {
      name: "Exit",
      value: "nav:exit",
    },
  ];
}
