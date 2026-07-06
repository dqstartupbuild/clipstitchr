import { formatSuccessText } from "./formatSuccessText.js";

export function logSuccess(message: string) {
  console.log(`${formatSuccessText("[ok]")} ${message}`);
}
