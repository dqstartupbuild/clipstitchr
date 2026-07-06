import { formatAccentText } from "./formatAccentText.js";

export function logInfo(message: string) {
  console.log(`${formatAccentText("[info]")} ${message}`);
}
