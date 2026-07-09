import type { InteractiveTuiOutputStream } from "./InteractiveTuiOutputStream.js";

export function exitInteractiveTuiScreen(
  stdout: InteractiveTuiOutputStream = process.stdout,
) {
  if (stdout.isTTY) {
    stdout.write("\u001B[?1049l");
  }
}
