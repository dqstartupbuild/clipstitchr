export function parseSocialTargetControls(controlsJson: string) {
  let controls: unknown;

  try {
    controls = JSON.parse(controlsJson);
  } catch {
    throw new Error("Social post controls must be valid JSON.");
  }

  if (!controls || typeof controls !== "object" || Array.isArray(controls)) {
    throw new Error("Social post controls are invalid.");
  }

  return controls as Record<string, unknown>;
}
