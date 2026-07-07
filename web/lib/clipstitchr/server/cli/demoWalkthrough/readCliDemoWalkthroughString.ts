import { truncateCliDemoWalkthroughText } from "./truncateCliDemoWalkthroughText";

export function readCliDemoWalkthroughString(
  value: unknown,
  maxLength: number,
) {
  return typeof value === "string" && value.trim()
    ? truncateCliDemoWalkthroughText(value.trim(), maxLength)
    : undefined;
}
