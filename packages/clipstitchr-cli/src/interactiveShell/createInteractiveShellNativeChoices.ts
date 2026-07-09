import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellNativeAction } from "./InteractiveShellNativeAction.js";
import { createInteractiveShellNavigationChoices } from "./createInteractiveShellNavigationChoices.js";

export function createInteractiveShellNativeChoices(): InteractiveShellChoice<InteractiveShellNativeAction>[] {
  return [
    {
      name: "Set up native recording",
      value: "native-init",
    },
    {
      name: "Check native setup",
      value: "native-check",
    },
    ...createInteractiveShellNavigationChoices({ includeBack: true }),
  ];
}
