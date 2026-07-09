import { Box, Text } from "ink";

export function InteractiveTuiComposer(input: {
  commandText: string;
  cursorIndex: number;
  isCommandMode: boolean;
}) {
  if (!input.isCommandMode) {
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
