import { formatMutedText } from "./formatMutedText.js";

export function logKeyValue(label: string, value: string) {
  console.log(`${formatMutedText(`${label}:`)} ${value}`);
}
