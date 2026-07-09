import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeDemoAutoGuide } from "../../dist/commands/sanitizeDemoAutoGuide.js";
import type { DemoWalkthroughGuide } from "../../src/demoGuide/DemoWalkthroughGuide.js";

const guide: DemoWalkthroughGuide = {
  appType: "web",
  createdAt: "2026-01-01T00:00:00.000Z",
  flowName: "Open the product",
  flowPath: "/",
  goal: "Show the homepage",
  id: "guide_test",
  name: "Open the product",
  productId: "product_test",
  productName: "ClipStitchr",
  source: "ai-assisted",
  steps: [
    { id: "step-1", label: "Open /" },
    { id: "step-2", label: "Wait for ClipStitchr uses cookies" },
    { id: "step-3", label: "Scroll through main public sections" },
  ],
  title: "Homepage walkthrough",
  updatedAt: "2026-01-01T00:00:00.000Z",
  version: 1,
};

describe("sanitizeDemoAutoGuide", () => {
  it("removes browser-noise steps from live guides", () => {
    const sanitizedGuide = sanitizeDemoAutoGuide({
      guide,
      targetMode: "live",
    });

    assert.deepEqual(
      sanitizedGuide.steps.map((step) => step.label),
      ["Open /", "Scroll through main public sections"],
    );
  });

  it("keeps local guides unchanged", () => {
    assert.equal(
      sanitizeDemoAutoGuide({
        guide,
        targetMode: "local",
      }),
      guide,
    );
  });
});
