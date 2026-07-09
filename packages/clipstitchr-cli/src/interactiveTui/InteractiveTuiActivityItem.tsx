import { Text } from "ink";
import type { InteractiveTuiActivityEntry } from "./InteractiveTuiActivityEntry.js";

export function InteractiveTuiActivityItem(input: {
  entry: InteractiveTuiActivityEntry;
}) {
  if (input.entry.kind === "error") {
    return <Text color="red">[error] {input.entry.message}</Text>;
  }

  if (input.entry.kind === "success") {
    return <Text color="green">[ok] {input.entry.message}</Text>;
  }

  return <Text color="cyan">{">"} {input.entry.message}</Text>;
}
