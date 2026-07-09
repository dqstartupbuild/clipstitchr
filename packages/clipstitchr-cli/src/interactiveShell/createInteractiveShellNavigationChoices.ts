import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";
import type { InteractiveShellNavigationAction } from "./InteractiveShellNavigationAction.js";

export function createInteractiveShellNavigationChoices(input: {
  includeBack: boolean;
}): InteractiveShellChoice<InteractiveShellNavigationAction>[] {
  const choices: InteractiveShellChoice<InteractiveShellNavigationAction>[] = [
    {
      name: "Type a slash command",
      value: "nav:slash",
    },
  ];

  if (input.includeBack) {
    choices.push({
      name: "Back",
      value: "nav:back",
    });
  }

  choices.push(
    {
      name: "Main menu",
      value: "nav:main",
    },
    {
      name: "Exit",
      value: "nav:exit",
    },
  );

  return choices;
}
