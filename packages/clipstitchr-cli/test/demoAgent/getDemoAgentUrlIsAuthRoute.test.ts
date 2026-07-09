import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDemoAgentUrlIsAuthRoute } from "../../dist/demoAgent/getDemoAgentUrlIsAuthRoute.js";

describe("getDemoAgentUrlIsAuthRoute", () => {
  it("detects common auth routes", () => {
    assert.equal(
      getDemoAgentUrlIsAuthRoute("https://example.com/sign-in"),
      true,
    );
    assert.equal(getDemoAgentUrlIsAuthRoute("https://example.com/login"), true);
    assert.equal(getDemoAgentUrlIsAuthRoute("https://example.com/auth/callback"), true);
  });

  it("does not mark ordinary routes as auth", () => {
    assert.equal(getDemoAgentUrlIsAuthRoute("https://example.com/"), false);
    assert.equal(
      getDemoAgentUrlIsAuthRoute("https://example.com/features"),
      false,
    );
  });
});
