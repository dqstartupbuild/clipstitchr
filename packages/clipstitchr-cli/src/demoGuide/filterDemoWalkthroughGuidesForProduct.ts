import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";

export function filterDemoWalkthroughGuidesForProduct(
  guides: DemoWalkthroughGuide[],
  productId: string,
) {
  return guides.filter((guide) => !guide.productId || guide.productId === productId);
}
