import { colorize } from "./colorize.js";
import { terminalAnsiCodes } from "./terminalAnsiCodes.js";

export function formatCommandText(text: string) {
  return colorize(text, terminalAnsiCodes.command);
}
