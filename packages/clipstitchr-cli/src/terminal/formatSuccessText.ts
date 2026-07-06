import { colorize } from "./colorize.js";
import { terminalAnsiCodes } from "./terminalAnsiCodes.js";

export function formatSuccessText(text: string) {
  return colorize(text, terminalAnsiCodes.success);
}
