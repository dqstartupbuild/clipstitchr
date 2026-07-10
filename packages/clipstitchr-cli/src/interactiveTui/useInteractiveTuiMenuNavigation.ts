import { useInput } from "ink";
import { useEffect, useMemo, useState } from "react";
import type { InteractiveShellChoice } from "../interactiveShell/InteractiveShellChoice.js";
import type { InteractiveShellContext } from "../interactiveShell/InteractiveShellContext.js";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import { getInteractiveTuiMenuChoices } from "./getInteractiveTuiMenuChoices.js";
import { getNextInteractiveTuiSelectionIndex } from "./getNextInteractiveTuiSelectionIndex.js";
import { useStableInteractiveTuiInputHandler } from "./useStableInteractiveTuiInputHandler.js";

export function useInteractiveTuiMenuNavigation(input: {
  context?: InteractiveShellContext;
  currentMenu: InteractiveShellMenu;
  isActive: boolean;
  onBack: () => void;
  onChoose: (choice: InteractiveShellChoice<string>) => void;
  onOpenCommand: (initialCommand?: string) => void;
  view: "menu" | "result";
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const choices = useMemo(
    () =>
      getInteractiveTuiMenuChoices(
        input.currentMenu,
        input.context,
        input.view,
      ),
    [input.context, input.currentMenu, input.view],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [input.context, input.currentMenu, input.view]);

  const handleInput = useStableInteractiveTuiInputHandler(
    (typedInput, key) => {
      if (
        input.view === "result" &&
        (key.tab || key.leftArrow || key.rightArrow)
      ) {
        setSelectedIndex((currentIndex) =>
          getNextInteractiveTuiSelectionIndex({
            currentIndex,
            direction:
              key.leftArrow || (key.tab && key.shift) ? "up" : "down",
            itemCount: choices.length,
          }),
        );
        return;
      }

      if (key.upArrow || key.downArrow) {
        if (input.view === "result") {
          return;
        }

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

      if (
        key.escape &&
        (input.view === "result" || input.currentMenu !== "main")
      ) {
        input.onBack();
      }
    },
  );
  useInput(handleInput, { isActive: input.isActive });

  return { choices, selectedIndex };
}
