import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";

export function createDemoWalkthroughGuideSortValue(
  guide: Pick<DemoWalkthroughGuide, "createdAt" | "updatedAt">,
) {
  return Date.parse(guide.updatedAt) || Date.parse(guide.createdAt) || 0;
}
