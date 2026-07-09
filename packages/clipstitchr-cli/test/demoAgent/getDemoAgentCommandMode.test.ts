import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDemoAgentCommandMode } from "../../dist/commands/getDemoAgentCommandMode.js";

describe("getDemoAgentCommandMode", () => {
  it("uses a saved guide when one is provided", () => {
    assert.equal(
      getDemoAgentCommandMode({
        guide: "Checkout flow",
      }),
      "saved-guide",
    );
  });

  it("creates a guide when no guide is provided", () => {
    assert.equal(getDemoAgentCommandMode({}), "create-guide");
  });
});
