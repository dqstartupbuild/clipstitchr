import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDemoAgentPolicy } from "../../dist/demoAgent/createDemoAgentPolicy.js";

describe("createDemoAgentPolicy", () => {
  it("keeps quick-start defaults safe", () => {
    const policy = createDemoAgentPolicy({
      allowedOrigin: "http://localhost:3000",
      flows: [
        {
          name: "Upload flow",
          path: "/upload",
        },
      ],
    });

    assert.equal(policy.allowFileUploads, false);
    assert.equal(policy.requiresApprovalBeforeUpload, true);
    assert.deepEqual(policy.allowedOrigins, ["http://localhost:3000"]);
    assert.deepEqual(policy.allowedRoutes, ["/", "/upload"]);
    assert.equal(policy.maxActions, 80);
    assert.equal(policy.maxRecordingSeconds, 180);
  });
});
