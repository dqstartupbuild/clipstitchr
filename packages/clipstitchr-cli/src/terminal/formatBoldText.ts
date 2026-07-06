import { colorize } from "./colorize.js";
import { terminalAnsiCodes } from "./terminalAnsiCodes.js";

export function formatBoldText(text: string) {
  return colorize(text, terminalAnsiCodes.bold);
}
