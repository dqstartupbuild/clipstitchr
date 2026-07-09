import { Box, Text } from "ink";
import type { InteractiveShellChoice } from "../interactiveShell/InteractiveShellChoice.js";
import { getInteractiveTuiVisibleChoices } from "./getInteractiveTuiVisibleChoices.js";

export function InteractiveTuiMenu(input: {
  choices: InteractiveShellChoice<string>[];
  isActive: boolean;
  selectedIndex: number;
}) {
  const visible = getInteractiveTuiVisibleChoices({
    choices: input.choices,
    selectedIndex: input.selectedIndex,
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      {visible.hasMoreAbove ? <Text dimColor>  More above</Text> : null}
      {visible.choices.map((choice, index) => {
        const isSelected = input.isActive && index === visible.selectedIndex;

        return (
          <Box key={choice.value}>
            <Text bold={isSelected} color={isSelected ? "cyan" : undefined}>
              {isSelected ? "> " : "  "}
              {choice.name}
            </Text>
          </Box>
        );
      })}
      {visible.hasMoreBelow ? <Text dimColor>  More below</Text> : null}
    </Box>
  );
}
