export function getAppHookGeneratorTraitFill(
  templateId: string,
  desiredOutcome: string,
) {
  if (templateId === "APP-041") {
    return `wants this result: ${desiredOutcome}`;
  }

  if (templateId === "APP-042") {
    return `this is the result you want: ${desiredOutcome}`;
  }

  return `want this result: ${desiredOutcome}`;
}
