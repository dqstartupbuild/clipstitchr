import { Box, Text } from "ink";
import type { InteractiveTuiMode } from "./InteractiveTuiMode.js";

export function InteractiveTuiComposer(input: {
  activeLabel?: string;
  commandText: string;
  cursorIndex: number;
  mode: InteractiveTuiMode;
}) {
  if (input.mode === "running") {
    return (
      <Box marginTop={1}>
        <Text color="yellow">[working] {input.activeLabel}</Text>
      </Box>
    );
  }

  if (input.mode === "menu") {
    return (
      <Box marginTop={1}>
        <Text color="cyan">{"> "}</Text>
        <Text dimColor>Press / to type a command</Text>
      </Box>
    );
  }

  const beforeCursor = input.commandText.slice(0, input.cursorIndex);
  const cursorCharacter = input.commandText[input.cursorIndex] ?? " ";
  const afterCursor = input.commandText.slice(input.cursorIndex + 1);

  return (
    <Box marginTop={1}>
      <Text color="cyan">{"> "}</Text>
      <Text>{beforeCursor}</Text>
      <Text inverse>{cursorCharacter}</Text>
      <Text>{afterCursor}</Text>
    </Box>
  );
}
