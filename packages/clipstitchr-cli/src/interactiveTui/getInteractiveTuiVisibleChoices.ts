import type { InteractiveShellChoice } from "../interactiveShell/InteractiveShellChoice.js";

export function getInteractiveTuiVisibleChoices<T extends string>(input: {
  choices: InteractiveShellChoice<T>[];
  maximumVisibleChoices?: number;
  selectedIndex: number;
}) {
  const maximumVisibleChoices = Math.max(1, input.maximumVisibleChoices ?? 9);
  const maximumStartIndex = Math.max(
    0,
    input.choices.length - maximumVisibleChoices,
  );
  const preferredStartIndex =
    input.selectedIndex - Math.floor(maximumVisibleChoices / 2);
  const startIndex = Math.min(
    maximumStartIndex,
    Math.max(0, preferredStartIndex),
  );
  const choices = input.choices.slice(
    startIndex,
    startIndex + maximumVisibleChoices,
  );

  return {
    choices,
    hasMoreAbove: startIndex > 0,
    hasMoreBelow: startIndex + choices.length < input.choices.length,
    selectedIndex: input.selectedIndex - startIndex,
  };
}
