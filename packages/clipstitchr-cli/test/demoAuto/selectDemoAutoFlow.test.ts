import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectDemoAutoFlow } from "../../dist/commands/selectDemoAutoFlow.js";

describe("selectDemoAutoFlow", () => {
  it("prefers a flow matching the linked local URL path", () => {
    const flow = selectDemoAutoFlow({
      flows: [
        { confidence: "high", name: "Home", path: "/" },
        { confidence: "medium", name: "Dashboard", path: "/dashboard" },
      ],
      localUrl: "http://localhost:3000/dashboard",
    });

    assert.equal(flow?.name, "Dashboard");
  });

  it("falls back to a high-confidence flow", () => {
    const flow = selectDemoAutoFlow({
      flows: [
        { confidence: "low", name: "Settings", path: "/settings" },
        { confidence: "high", name: "Dashboard", path: "/dashboard" },
      ],
      localUrl: "http://localhost:3000/missing",
    });

    assert.equal(flow?.name, "Dashboard");
  });
});
