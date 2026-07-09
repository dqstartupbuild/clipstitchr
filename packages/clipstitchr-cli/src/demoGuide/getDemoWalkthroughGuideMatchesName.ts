import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { createDemoWalkthroughGuideLookupKey } from "./createDemoWalkthroughGuideLookupKey.js";

export function getDemoWalkthroughGuideMatchesName(
  guide: DemoWalkthroughGuide,
  reference: string,
) {
  return (
    createDemoWalkthroughGuideLookupKey(guide.name) ===
    createDemoWalkthroughGuideLookupKey(reference)
  );
}
