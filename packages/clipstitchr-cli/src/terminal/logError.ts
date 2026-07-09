import { formatErrorText } from "./formatErrorText.js";

export function logError(message: string) {
  console.error(`${formatErrorText("[error]")} ${message}`);
}
