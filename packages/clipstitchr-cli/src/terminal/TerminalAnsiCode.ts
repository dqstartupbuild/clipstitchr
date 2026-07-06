import type { terminalAnsiCodes } from "./terminalAnsiCodes.js";

export type TerminalAnsiCode =
  (typeof terminalAnsiCodes)[keyof typeof terminalAnsiCodes];
