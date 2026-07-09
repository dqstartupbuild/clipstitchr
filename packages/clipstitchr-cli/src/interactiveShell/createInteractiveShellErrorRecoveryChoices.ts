import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellErrorRecoveryAction } from "./InteractiveShellErrorRecoveryAction.js";

export function createInteractiveShellErrorRecoveryChoices(): InteractiveShellChoice<InteractiveShellErrorRecoveryAction>[] {
  return [
    {
      name: "Try again",
      value: "retry",
    },
    {
      name: "Back",
      value: "back",
    },
    {
      name: "Main menu",
      value: "main",
    },
    {
      name: "Exit",
      value: "exit",
    },
  ];
}
