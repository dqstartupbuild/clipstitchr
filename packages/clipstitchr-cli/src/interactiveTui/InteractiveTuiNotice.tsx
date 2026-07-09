import { Box, Text } from "ink";
import type { InteractiveShellNotice } from "../interactiveShell/InteractiveShellNotice.js";

export function InteractiveTuiNotice(input: {
  notice?: InteractiveShellNotice;
}) {
  if (!input.notice) {
    return null;
  }

  const color =
    input.notice.kind === "error"
      ? "red"
      : input.notice.kind === "success"
        ? "green"
        : "cyan";

  return (
    <Box marginTop={1}>
      <Text color={color}>{input.notice.message}</Text>
    </Box>
  );
}
