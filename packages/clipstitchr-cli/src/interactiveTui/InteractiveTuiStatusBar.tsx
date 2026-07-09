import { Box, Text } from "ink";

export function InteractiveTuiStatusBar(input: {
  isCommandMode: boolean;
}) {
  const message = input.isCommandMode
    ? "Tab complete | Enter run | Esc menu | Ctrl+P history"
    : "Up/Down move | Enter choose | / command | Esc back | Ctrl+C exit";

  return (
    <Box borderColor="gray" borderStyle="single" marginTop={1} paddingX={1}>
      <Text dimColor>{message}</Text>
    </Box>
  );
}
