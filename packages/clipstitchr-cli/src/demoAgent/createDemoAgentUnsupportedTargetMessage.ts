import type { DemoAgentTargetMode } from "./DemoAgentTargetMode.js";

export function createDemoAgentUnsupportedTargetMessage(input: {
  projectType: string;
  targetMode: DemoAgentTargetMode;
}) {
  if (input.targetMode === "live") {
    return `Recording a live ${input.projectType} app needs OpenAI Computer Use. Add OPENAI_API_KEY locally or run with --driver openai-computer.`;
  }

  return "Local automatic demos control browser surfaces today. For iOS, Android, desktop, or backend projects, use --target live with a live or staging URL, or use clipstitchr demo make for manual simulator/device recording. Direct simulator and device control needs extra device-control support in the CLI.";
}
