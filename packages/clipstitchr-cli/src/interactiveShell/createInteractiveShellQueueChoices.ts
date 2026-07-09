import type { QueueMenuAction } from "../queueMenu/QueueMenuAction.js";
import { createQueueMenuChoices } from "../queueMenu/createQueueMenuChoices.js";
import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";
import { createInteractiveShellNavigationChoices } from "./createInteractiveShellNavigationChoices.js";

export function createInteractiveShellQueueChoices(): InteractiveShellChoice<
  QueueMenuAction | InteractiveShellNavigationAction
>[] {
  return [
    ...createQueueMenuChoices(),
    ...createInteractiveShellNavigationChoices({ includeBack: true }),
  ];
}
