import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoAutoTargetAudience } from "../../dist/commands/createDemoAutoTargetAudience.js";

describe("createDemoAutoTargetAudience", () => {
  it("uses an explicit audience when provided", () => {
    assert.equal(
      createDemoAutoTargetAudience({
        audience: "busy founders",
        product: { id: "product_1", name: "ClipStitchr" },
      }),
      "busy founders",
    );
  });

  it("creates a default audience from the product", () => {
    assert.equal(
      createDemoAutoTargetAudience({
        product: { id: "product_1", name: "ClipStitchr" },
      }),
      "people evaluating ClipStitchr",
    );
  });
});
