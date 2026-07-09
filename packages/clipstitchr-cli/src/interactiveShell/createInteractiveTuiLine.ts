import { fitInteractiveTuiText } from "./fitInteractiveTuiText.js";

export function createInteractiveTuiLine(input: {
  text: string;
  width: number;
}) {
  return `| ${fitInteractiveTuiText({
    text: input.text,
    width: input.width - 4,
  })} |`;
}
