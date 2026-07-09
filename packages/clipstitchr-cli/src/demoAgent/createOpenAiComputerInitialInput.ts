import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { DemoWalkthroughStep } from "../demoGuide/DemoWalkthroughStep.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { formatOpenAiComputerAppContext } from "./formatOpenAiComputerAppContext.js";

export function createOpenAiComputerInitialInput(input: {
  appContext?: ScannedAppContext;
  guide: DemoWalkthroughGuide;
  policy: DemoAgentPolicy;
  step: DemoWalkthroughStep;
  stepIndex: number;
}) {
  return [
    "You are recording a local product demo in an isolated browser.",
    "Use the computer tool to complete only the current guide step, then stop calling the computer tool and say the step is done.",
    "",
    `Demo title: ${input.guide.title}`,
    `Demo goal: ${input.guide.goal}`,
    `Current step ${input.stepIndex + 1} of ${input.guide.steps.length}: ${input.step.label}`,
    input.step.notes ? `Step notes: ${input.step.notes}` : "",
    "",
    "Hard rules:",
    `- Stay inside these local origins: ${input.policy.allowedOrigins.join(", ")}.`,
    `- Stay on these allowed routes when possible: ${input.policy.allowedRoutes.join(", ")}.`,
    "- Do not enter passwords, API keys, secrets, payment details, production account data, or private customer data.",
    "- Do not delete data, change billing, publish content, send email, or take any irreversible action.",
    "- Do not upload a local file. If the step requires a file upload, stop and explain that human approval is needed.",
    "- If the page asks for sign-in, stop and explain that the user needs to sign in during the browser preflight.",
    "- Prefer small, visible actions. Ask for a screenshot when you need to inspect the page.",
    "",
    "Source-derived app hints:",
    formatOpenAiComputerAppContext(input.appContext),
  ]
    .filter(Boolean)
    .join("\n");
}
