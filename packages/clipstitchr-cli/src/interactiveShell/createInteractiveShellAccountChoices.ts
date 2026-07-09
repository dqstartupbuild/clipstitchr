import type { InteractiveShellAccountAction } from "./InteractiveShellAccountAction.js";
import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import { createInteractiveShellNavigationChoices } from "./createInteractiveShellNavigationChoices.js";

export function createInteractiveShellAccountChoices(): InteractiveShellChoice<InteractiveShellAccountAction>[] {
  return [
    {
      name: "Connect this repo",
      value: "link",
    },
    {
      name: "Connect this machine",
      value: "login",
    },
    {
      name: "Show account and repo status",
      value: "status",
    },
    {
      name: "Disconnect this repo",
      value: "unlink",
    },
    {
      name: "Disconnect this machine",
      value: "logout",
    },
    ...createInteractiveShellNavigationChoices({ includeBack: true }),
  ];
}
