import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { createDemoWalkthroughGuideName } from "./createDemoWalkthroughGuideName.js";
import { normalizeDemoWalkthroughGuideName } from "./normalizeDemoWalkthroughGuideName.js";

export function ensureDemoWalkthroughGuideName(guide: DemoWalkthroughGuide) {
  const rawName = (guide as { name?: unknown }).name;
  const name =
    typeof rawName === "string" && normalizeDemoWalkthroughGuideName(rawName)
      ? normalizeDemoWalkthroughGuideName(rawName)
      : createDemoWalkthroughGuideName({
          flowName: guide.flowName,
          goal: guide.goal,
          title: guide.title,
        });

  return {
    ...guide,
    name,
  };
}
