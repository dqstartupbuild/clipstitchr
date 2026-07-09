import { Box, Text } from "ink";
import type { InteractiveTuiMode } from "./InteractiveTuiMode.js";

export function InteractiveTuiStatusBar(input: {
  mode: InteractiveTuiMode;
}) {
  const message =
    input.mode === "command"
      ? "Tab complete | Enter run | Esc menu | Ctrl+P history"
      : input.mode === "running"
        ? "Action in progress"
        : "Up/Down move | Enter choose | / command | Esc back | Ctrl+C exit";

  return (
    <Box borderColor="gray" borderStyle="single" marginTop={1} paddingX={1}>
      <Text dimColor>{message}</Text>
    </Box>
  );
}
