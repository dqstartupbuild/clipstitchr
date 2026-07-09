import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoAutoGuideGenerationGoal } from "../../dist/commands/createDemoAutoGuideGenerationGoal.js";

describe("createDemoAutoGuideGenerationGoal", () => {
  it("keeps local goals unchanged", () => {
    assert.equal(
      createDemoAutoGuideGenerationGoal({
        goal: "Show the dashboard",
        targetMode: "local",
      }),
      "Show the dashboard",
    );
  });

  it("adds public-page constraints for live targets", () => {
    const goal = createDemoAutoGuideGenerationGoal({
      goal: "Show the homepage",
      targetMode: "live",
    });

    assert.match(goal, /Show the homepage/);
    assert.match(goal, /signed-out visitor/);
    assert.match(goal, /Do not click sign in, sign up/);
  });
});
