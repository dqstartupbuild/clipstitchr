import { formatAccentText } from "./formatAccentText.js";
import { formatBoldText } from "./formatBoldText.js";
import { formatMutedText } from "./formatMutedText.js";

export function logBrandHeader(subtitle?: string) {
  console.log(formatAccentText(formatBoldText("ClipStitchr")));

  if (subtitle) {
    console.log(formatMutedText(subtitle));
  }

  console.log("");
}
