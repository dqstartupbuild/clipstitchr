import { formatAccentText } from "./formatAccentText.js";

export function logStep(message: string) {
  console.log(`${formatAccentText("[..]")} ${message}`);
}
