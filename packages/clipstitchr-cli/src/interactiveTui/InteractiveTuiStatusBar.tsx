import { Text } from "ink";
import type { InteractiveTuiMode } from "./InteractiveTuiMode.js";

export function InteractiveTuiStatusBar(input: {
  mode: InteractiveTuiMode;
}) {
  const message =
    input.mode === "command"
      ? "Tab complete | Enter use | Esc back | Ctrl+P history"
      : input.mode === "result"
        ? "Up/Down scroll | Tab actions | Enter choose | / command | Esc back"
        : "Up/Down move | Enter choose | / command | Esc back | Ctrl+C exit";

  return <Text dimColor>{message}</Text>;
}
