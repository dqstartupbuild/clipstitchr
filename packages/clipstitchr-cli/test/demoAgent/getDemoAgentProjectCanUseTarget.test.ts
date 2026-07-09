import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDemoAgentProjectCanUseTarget } from "../../dist/demoAgent/getDemoAgentProjectCanUseTarget.js";

describe("getDemoAgentProjectCanUseTarget", () => {
  it("allows local web projects", () => {
    assert.equal(
      getDemoAgentProjectCanUseTarget({
        driver: "structured-planner",
        projectType: "web",
        targetMode: "local",
      }),
      true,
    );
  });

  it("allows live non-web projects with OpenAI Computer Use", () => {
    assert.equal(
      getDemoAgentProjectCanUseTarget({
        driver: "openai-computer",
        projectType: "ios",
        targetMode: "live",
      }),
      true,
    );
  });

  it("does not allow local non-web projects through the browser agent", () => {
    assert.equal(
      getDemoAgentProjectCanUseTarget({
        driver: "openai-computer",
        projectType: "ios",
        targetMode: "local",
      }),
      false,
    );
  });
});
