import { colorize } from "./colorize.js";
import { terminalAnsiCodes } from "./terminalAnsiCodes.js";

export function formatWarningText(text: string) {
  return colorize(text, terminalAnsiCodes.warning);
}
