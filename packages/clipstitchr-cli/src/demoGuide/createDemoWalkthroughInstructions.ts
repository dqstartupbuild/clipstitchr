import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";

export function createDemoWalkthroughInstructions(guide: DemoWalkthroughGuide) {
  return [
    `# ${guide.title}`,
    "",
    "Use this as a local recording guide. Keep the user in control, stay inside the approved app, and stop if anything looks risky.",
    "",
    "## Goal",
    "",
    guide.goal,
    "",
    "## Scope",
    "",
    `- Product: ${guide.productName ?? "Selected product"}`,
    `- App type: ${guide.appType ?? "app"}`,
    `- Flow: ${guide.flowName ?? "Selected flow"}`,
    guide.flowPath ? `- Starting path: ${guide.flowPath}` : undefined,
    "",
    "## Steps",
    "",
    ...guide.steps.map((step, index) => `${index + 1}. ${step.label}`),
    "",
    "## Stop And Ask First",
    "",
    "- The page asks for billing, payment, deleting, publishing, or real customer data.",
    "- The app leaves the expected local product flow.",
    "- You need a password, API key, private token, or production account.",
    "- The next action is unclear.",
    "",
    "## Hand Back To ClipStitchr",
    "",
    `After the recording is ready, use clipstitchr demo manual --guide ${guide.id} for the normal guided recording flow.`,
    "",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}
