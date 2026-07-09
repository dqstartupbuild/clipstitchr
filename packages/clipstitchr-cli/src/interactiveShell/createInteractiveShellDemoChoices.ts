import type { DemoMenuAction } from "../demoMenu/DemoMenuAction.js";
import { createDemoMenuChoices } from "../demoMenu/createDemoMenuChoices.js";
import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";
import { createInteractiveShellNavigationChoices } from "./createInteractiveShellNavigationChoices.js";

export function createInteractiveShellDemoChoices(): InteractiveShellChoice<
  DemoMenuAction | InteractiveShellNavigationAction
>[] {
  return [
    ...createDemoMenuChoices(),
    ...createInteractiveShellNavigationChoices({ includeBack: true }),
  ];
}
