import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDemoAgentPlannerRetryDelayMs } from "../../dist/api/getDemoAgentPlannerRetryDelayMs.js";

describe("getDemoAgentPlannerRetryDelayMs", () => {
  it("uses explicit retry timing from API messages", () => {
    assert.equal(
      getDemoAgentPlannerRetryDelayMs(
        new Error("Planner provider is busy. Try again in 6 seconds."),
        0,
      ),
      6000,
    );
  });

  it("backs off provider queue expiration messages", () => {
    assert.equal(
      getDemoAgentPlannerRetryDelayMs(
        new Error(
          '{"code":"ExpiredInQueue","message":"Too many concurrent requests"}',
        ),
        1,
      ),
      10000,
    );
  });

  it("does not retry permanent planner errors", () => {
    assert.equal(
      getDemoAgentPlannerRetryDelayMs(
        new Error("Planner action type is not supported."),
        0,
      ),
      undefined,
    );
  });

  it("does not retry normal account quota limits", () => {
    assert.equal(
      getDemoAgentPlannerRetryDelayMs(
        new Error("Rate limit exceeded. Try again in 3600 seconds."),
        0,
      ),
      undefined,
    );
  });
});
