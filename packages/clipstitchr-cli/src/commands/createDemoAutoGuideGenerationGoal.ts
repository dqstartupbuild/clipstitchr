import type { DemoAgentTargetMode } from "../demoAgent/DemoAgentTargetMode.js";

const livePublicPageConstraint =
  "Stay on pages a signed-out visitor can view. Do not click sign in, sign up, start free, open dashboard, upload, checkout, or other account-starting buttons unless the request explicitly asks for an auth preflight. Do not create steps for cookie banners, privacy notices, newsletters, chat widgets, or other browser noise. Prefer scrolling and opening public sections on the selected live URL.";

export function createDemoAutoGuideGenerationGoal(input: {
  goal: string;
  targetMode: DemoAgentTargetMode;
}) {
  if (input.targetMode !== "live") {
    return input.goal;
  }

  return `${input.goal} ${livePublicPageConstraint}`;
}
