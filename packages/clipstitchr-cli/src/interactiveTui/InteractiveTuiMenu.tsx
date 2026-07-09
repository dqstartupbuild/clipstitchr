import { Box, Text, useStdout } from "ink";
import type { InteractiveShellChoice } from "../interactiveShell/InteractiveShellChoice.js";
import { getInteractiveTuiMaximumVisibleChoices } from "./getInteractiveTuiMaximumVisibleChoices.js";
import { getInteractiveTuiVisibleChoices } from "./getInteractiveTuiVisibleChoices.js";

export function InteractiveTuiMenu(input: {
  choices: InteractiveShellChoice<string>[];
  isActive: boolean;
  maximumVisibleChoices?: number;
  selectedIndex: number;
}) {
  const { stdout } = useStdout();
  const visible = getInteractiveTuiVisibleChoices({
    choices: input.choices,
    maximumVisibleChoices:
      input.maximumVisibleChoices ??
      getInteractiveTuiMaximumVisibleChoices(stdout.rows),
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
