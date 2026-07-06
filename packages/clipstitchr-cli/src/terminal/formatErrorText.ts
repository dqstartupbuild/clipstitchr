import { colorize } from "./colorize.js";
import { terminalAnsiCodes } from "./terminalAnsiCodes.js";

export function formatErrorText(text: string) {
  return colorize(text, terminalAnsiCodes.error);
}
