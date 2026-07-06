import { formatWarningText } from "./formatWarningText.js";

export function logWarning(message: string) {
  console.warn(`${formatWarningText("[warn]")} ${message}`);
}
