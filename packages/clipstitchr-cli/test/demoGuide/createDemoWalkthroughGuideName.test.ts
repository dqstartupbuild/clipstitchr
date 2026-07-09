import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoWalkthroughGuideName } from "../../dist/demoGuide/createDemoWalkthroughGuideName.js";

describe("createDemoWalkthroughGuideName", () => {
  it("prefers the demonstrated flow", () => {
    assert.equal(
      createDemoWalkthroughGuideName({
        flowName: "Upload a product demo",
        goal: "Show uploads",
        title: "Demo walkthrough",
      }),
      "Upload a product demo",
    );
  });

  it("falls back to the goal", () => {
    assert.equal(
      createDemoWalkthroughGuideName({
        goal: "Show the team dashboard",
      }),
      "Show the team dashboard",
    );
  });
});
