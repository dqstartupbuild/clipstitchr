import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDemoAgentSurface } from "../../dist/demoAgent/resolveDemoAgentSurface.js";

describe("resolveDemoAgentSurface", () => {
  it("defaults to browser", () => {
    assert.equal(resolveDemoAgentSurface({}), "browser");
  });

  it("uses the requested macOS window surface", () => {
    assert.equal(
      resolveDemoAgentSurface({ optionSurface: "macos-window" }),
      "macos-window",
    );
  });

  it("rejects unsupported surfaces", () => {
    assert.throws(
      () => resolveDemoAgentSurface({ optionSurface: "android-adb" }),
      /browser or --surface macos-window/,
    );
  });
});
