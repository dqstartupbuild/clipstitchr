import { Box, Text } from "ink";
import { getInteractiveTuiVisibleResultLines } from "./getInteractiveTuiVisibleResultLines.js";

export function InteractiveTuiResultOutput(input: {
  lines: string[];
  pageSize: number;
  startIndex: number;
}) {
  const visible = getInteractiveTuiVisibleResultLines(input);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold>Result (Up/Down scroll, Tab actions)</Text>
      {visible.hasMoreAbove ? <Text dimColor>More above</Text> : null}
      {visible.lines.map((line, index) => (
        <Text key={`${visible.startIndex + index}:${line}`} wrap="truncate-end">
          {line || " "}
        </Text>
      ))}
      {visible.hasMoreBelow ? <Text dimColor>More below</Text> : null}
    </Box>
  );
}
