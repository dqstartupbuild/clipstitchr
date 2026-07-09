import type { InteractiveTuiOutputStream } from "./InteractiveTuiOutputStream.js";

export function resetInteractiveTuiScreen(
  stdout: InteractiveTuiOutputStream = process.stdout,
) {
  if (stdout.isTTY) {
    stdout.write("\u001B[2J\u001B[H");
  }
}
