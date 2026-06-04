import { defaultAutomationStitchrColorChoice } from "../constants/defaultAutomationStitchrColorChoice";
import type { AutomationStitchrColorChoice } from "../types/AutomationStitchrColorChoice";
import { getCssColorHex } from "./getCssColorHex";

export function getAutomationStitchrColorChoice(
  value: unknown,
): AutomationStitchrColorChoice {
  if (value === "any") {
    return value;
  }

  if (typeof value !== "string") {
    return defaultAutomationStitchrColorChoice;
  }

  const color = getCssColorHex(value, "");

  return /^#[0-9a-fA-F]{6}$/.test(color)
    ? color
    : defaultAutomationStitchrColorChoice;
}
