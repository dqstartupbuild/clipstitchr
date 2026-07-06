import type { TerminalAnsiCode } from "./TerminalAnsiCode.js";
import { terminalAnsiCodes } from "./terminalAnsiCodes.js";
import { shouldUseTerminalColor } from "./shouldUseTerminalColor.js";

export function colorize(text: string, code: TerminalAnsiCode) {
  if (!shouldUseTerminalColor()) {
    return text;
  }

  return `${code}${text}${terminalAnsiCodes.reset}`;
}
