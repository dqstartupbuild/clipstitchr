import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";

export function createDemoWalkthroughGuideFileName(
  guide: Pick<DemoWalkthroughGuide, "id">,
) {
  return `${guide.id}.json`;
}
