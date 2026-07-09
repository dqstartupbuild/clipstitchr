import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDemoAutoGuideStepIsBrowserNoise } from "../../dist/commands/getDemoAutoGuideStepIsBrowserNoise.js";

describe("getDemoAutoGuideStepIsBrowserNoise", () => {
  it("detects cookie and consent steps", () => {
    assert.equal(
      getDemoAutoGuideStepIsBrowserNoise("Wait for ClipStitchr uses cookies"),
      true,
    );
    assert.equal(
      getDemoAutoGuideStepIsBrowserNoise("Close the privacy notice"),
      true,
    );
  });

  it("allows product walkthrough steps", () => {
    assert.equal(
      getDemoAutoGuideStepIsBrowserNoise("Scroll through main public sections"),
      false,
    );
  });
});
