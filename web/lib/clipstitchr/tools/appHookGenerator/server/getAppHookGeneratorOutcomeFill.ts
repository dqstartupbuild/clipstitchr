export function getAppHookGeneratorOutcomeFill(
  desiredOutcome: string,
  templateId: string,
) {
  const outcome = desiredOutcome
    .trim()
    .replace(/[.!?]+$/g, "")
    .replace(/^to\s+/i, "");

  if (templateId === "APP-080") {
    return `the path to ${outcome}`;
  }

  return /\b\w+ing\b/i.test(outcome.split(/\s+/)[0] ?? "")
    ? `makes ${outcome} feel easier`
    : `helps you ${outcome}`;
}
