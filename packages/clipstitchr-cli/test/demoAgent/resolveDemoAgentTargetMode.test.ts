import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDemoAgentTargetMode } from "../../dist/demoAgent/resolveDemoAgentTargetMode.js";

describe("resolveDemoAgentTargetMode", () => {
  it("defaults to local", () => {
    assert.equal(resolveDemoAgentTargetMode({}), "local");
  });

  it("uses an explicit target", () => {
    assert.equal(
      resolveDemoAgentTargetMode({ optionTarget: "live" }),
      "live",
    );
  });

  it("infers live when the one-off URL is not local", () => {
    assert.equal(
      resolveDemoAgentTargetMode({ optionUrl: "https://example.com/app" }),
      "live",
    );
  });

  it("rejects unsupported targets", () => {
    assert.throws(
      () => resolveDemoAgentTargetMode({ optionTarget: "production" }),
      /--target local or --target live/,
    );
  });
});
