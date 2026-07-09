type OpenAiComputerMouseButton = "left" | "middle" | "right";

export function normalizeOpenAiComputerMouseButton(
  button?: string,
): OpenAiComputerMouseButton {
  if (button === "right" || button === "middle") {
    return button;
  }

  return "left";
}
