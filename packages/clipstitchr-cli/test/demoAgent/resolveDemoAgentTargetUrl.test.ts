import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDemoAgentTargetUrl } from "../../dist/demoAgent/resolveDemoAgentTargetUrl.js";

describe("resolveDemoAgentTargetUrl", () => {
  it("uses the running local URL for local recordings", () => {
    assert.equal(
      resolveDemoAgentTargetUrl({
        configUrl: "http://localhost:3000",
        runningUrl: "http://localhost:5173",
        targetMode: "local",
      }),
      "http://localhost:5173",
    );
  });

  it("uses the product website URL for live recordings", () => {
    assert.equal(
      resolveDemoAgentTargetUrl({
        configUrl: "http://localhost:3000",
        productWebsiteUrl: "https://example.com",
        targetMode: "live",
      }),
      "https://example.com",
    );
  });

  it("rejects localhost URLs for live recordings", () => {
    assert.throws(
      () =>
        resolveDemoAgentTargetUrl({
          optionUrl: "http://localhost:3000",
          targetMode: "live",
        }),
      /public or staging URL/,
    );
  });

  it("rejects live URLs for local recordings", () => {
    assert.throws(
      () =>
        resolveDemoAgentTargetUrl({
          optionUrl: "https://example.com",
          targetMode: "local",
        }),
      /Use --target live/,
    );
  });
});
