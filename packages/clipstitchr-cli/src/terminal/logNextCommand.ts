import { formatCommandText } from "./formatCommandText.js";
import { formatMutedText } from "./formatMutedText.js";

export function logNextCommand(command: string) {
  console.log(`${formatMutedText("Next:")} ${formatCommandText(command)}`);
}
