import { useInput } from "ink";
import { useEffect, useMemo, useState } from "react";
import type { InteractiveShellChoice } from "../interactiveShell/InteractiveShellChoice.js";
import type { InteractiveShellContext } from "../interactiveShell/InteractiveShellContext.js";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import { getInteractiveTuiMenuChoices } from "./getInteractiveTuiMenuChoices.js";
import { getNextInteractiveTuiSelectionIndex } from "./getNextInteractiveTuiSelectionIndex.js";

export function useInteractiveTuiMenuNavigation(input: {
  context?: InteractiveShellContext;
  currentMenu: InteractiveShellMenu;
  isActive: boolean;
  onBack: () => void;
  onChoose: (choice: InteractiveShellChoice<string>) => void;
  onOpenCommand: (initialCommand?: string) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const choices = useMemo(
    () => getInteractiveTuiMenuChoices(input.currentMenu, input.context),
    [input.context, input.currentMenu],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [input.context, input.currentMenu]);

  useInput(
    (typedInput, key) => {
      if (key.upArrow || key.downArrow) {
        setSelectedIndex((currentIndex) =>
          getNextInteractiveTuiSelectionIndex({
            currentIndex,
            direction: key.downArrow ? "down" : "up",
            itemCount: choices.length,
          }),
        );
        return;
      }

      if (key.return) {
        const choice = choices[selectedIndex];

        if (choice) {
          input.onChoose(choice);
        }
        return;
      }

      if (typedInput.startsWith("/")) {
        input.onOpenCommand(typedInput);
        return;
      }

      if (key.escape && input.currentMenu !== "main") {
        input.onBack();
      }
    },
    { isActive: input.isActive },
  );

  return { choices, selectedIndex };
}
