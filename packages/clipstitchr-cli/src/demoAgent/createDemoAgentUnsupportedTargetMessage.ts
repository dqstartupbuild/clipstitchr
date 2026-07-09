import type { DemoAgentTargetMode } from "./DemoAgentTargetMode.js";

export function createDemoAgentUnsupportedTargetMessage(input: {
  projectType: string;
  targetMode: DemoAgentTargetMode;
}) {
  if (input.targetMode === "live") {
    return `Recording a live ${input.projectType} app needs OpenAI Computer Use. Run with --driver openai-computer and use --openai-mode relay or a local OPENAI_API_KEY.`;
  }

  return "Local automatic demos control browser surfaces today. For iOS, Android, desktop, or backend projects, use --surface macos-window for a visible macOS app window, use --target live with a live or staging URL, or use clipstitchr demo manual for manual simulator/device recording.";
}
