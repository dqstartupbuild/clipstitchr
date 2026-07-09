import { Box, Text } from "ink";

export function InteractiveTuiRunningView(input: { activeLabel?: string }) {
  return (
    <Box flexDirection="column">
      <Text color="yellow">[working] {input.activeLabel}</Text>
      <Text dimColor>
        Complete any question below. You will return here when it finishes.
      </Text>
    </Box>
  );
}
