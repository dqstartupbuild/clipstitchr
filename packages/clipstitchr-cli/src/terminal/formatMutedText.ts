import { colorize } from "./colorize.js";
import { terminalAnsiCodes } from "./terminalAnsiCodes.js";

export function formatMutedText(text: string) {
  return colorize(text, terminalAnsiCodes.muted);
}
