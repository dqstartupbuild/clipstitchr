import { defaultAutomationGenerationCount } from "../constants/defaultAutomationGenerationCount";
import type { AutomationGenerationCount } from "../types/AutomationGenerationCount";

export function getAutomationGenerationCount(
  value: unknown,
): AutomationGenerationCount {
  return value === 3 || value === 5 || value === 10
    ? value
    : defaultAutomationGenerationCount;
}
