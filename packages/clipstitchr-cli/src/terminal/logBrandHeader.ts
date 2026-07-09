import { interactiveTuiActiveEnvironmentVariable } from "../config/interactiveTuiActiveEnvironmentVariable.js";
import { formatAccentText } from "./formatAccentText.js";
import { formatBoldText } from "./formatBoldText.js";
import { formatMutedText } from "./formatMutedText.js";

export function logBrandHeader(subtitle?: string) {
  if (process.env[interactiveTuiActiveEnvironmentVariable] !== "1") {
    console.log(formatAccentText(formatBoldText("ClipStitchr")));
  }

  if (subtitle) {
    console.log(formatMutedText(subtitle));
  }

  console.log("");
}
