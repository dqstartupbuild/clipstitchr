import type { InteractiveShellAccountAction } from "./InteractiveShellAccountAction.js";
import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellContext } from "./InteractiveShellContext.js";
import { createInteractiveShellNavigationChoices } from "./createInteractiveShellNavigationChoices.js";

export function createInteractiveShellAccountChoices(
  context?: InteractiveShellContext,
): InteractiveShellChoice<InteractiveShellAccountAction>[] {
  const repoChoices: InteractiveShellChoice<InteractiveShellAccountAction>[] =
    context
      ? context.isRepoLinked
        ? [{ name: "Disconnect this repo", value: "unlink" }]
        : [{ name: "Connect this repo", value: "link" }]
      : [
          { name: "Connect this repo", value: "link" },
          { name: "Disconnect this repo", value: "unlink" },
        ];
  const accountChoices: InteractiveShellChoice<InteractiveShellAccountAction>[] =
    context
      ? context.isAccountConnected
        ? [{ name: "Disconnect this machine", value: "logout" }]
        : [{ name: "Connect this machine", value: "login" }]
      : [
          { name: "Connect this machine", value: "login" },
          { name: "Disconnect this machine", value: "logout" },
        ];

  return [
    ...repoChoices,
    ...accountChoices,
    {
      name: "Show account and repo status",
      value: "status",
    },
    {
      name: "Native setup and checks",
      value: "native",
    },
    {
      name: "Check settings",
      value: "doctor",
    },
    {
      name: "Update CLI",
      value: "update",
    },
    ...createInteractiveShellNavigationChoices({ includeBack: true }),
  ];
}
