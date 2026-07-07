import { normalizeDemoAgentMatchText } from "./normalizeDemoAgentMatchText.js";

export function getDemoAgentTextMatchesStep(text: string, stepLabel: string) {
  const normalizedText = normalizeDemoAgentMatchText(text);
  const normalizedStepLabel = normalizeDemoAgentMatchText(stepLabel);

  if (!normalizedText || !normalizedStepLabel) {
    return false;
  }

  return (
    normalizedStepLabel.includes(normalizedText) ||
    normalizedText.includes(normalizedStepLabel) ||
    normalizedText
      .split(" ")
      .some((word) => word.length >= 4 && normalizedStepLabel.includes(word))
  );
}
