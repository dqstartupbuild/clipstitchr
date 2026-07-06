import { colorize } from "./colorize.js";
import { terminalAnsiCodes } from "./terminalAnsiCodes.js";

export function formatAccentText(text: string) {
  return colorize(text, terminalAnsiCodes.accent);
}
