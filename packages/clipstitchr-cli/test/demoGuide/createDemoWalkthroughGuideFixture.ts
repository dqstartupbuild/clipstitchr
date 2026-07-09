import type { DemoWalkthroughGuide } from "../../src/demoGuide/DemoWalkthroughGuide.js";

export function createDemoWalkthroughGuideFixture(
  overrides: Partial<DemoWalkthroughGuide> = {},
) {
  const timestamp = "2026-01-01T00:00:00.000Z";

  return {
    appType: "web",
    createdAt: timestamp,
    flowName: "Checkout flow",
    flowPath: "/checkout",
    goal: "Show checkout",
    id: "guide_fixture",
    name: "Checkout flow",
    productId: "product_test",
    productName: "ClipStitchr",
    source: "cli-template",
    steps: [{ id: "step-1", label: "Open checkout" }],
    title: "Checkout walkthrough",
    updatedAt: timestamp,
    version: 1,
    ...overrides,
  } satisfies DemoWalkthroughGuide;
}
