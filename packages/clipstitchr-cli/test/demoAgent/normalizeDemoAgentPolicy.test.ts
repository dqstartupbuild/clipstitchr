import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeDemoAgentPolicy } from "../../dist/demoAgent/normalizeDemoAgentPolicy.js";

const basePolicy = {
  allowFileUploads: true,
  allowedRoutes: ["/"],
  approvedTestValues: {},
  approvedUploadFiles: [],
  blockedTextPatterns: [],
  maxActions: 80,
  maxRecordingSeconds: 180,
  requiresApprovalBeforeUpload: true,
  stuckStateLimit: 3,
  version: 1,
};

describe("normalizeDemoAgentPolicy", () => {
  it("allows local origins by default", () => {
    const policy = normalizeDemoAgentPolicy({
      ...basePolicy,
      allowedOrigins: ["http://localhost:3000"],
    });

    assert.deepEqual(policy.allowedOrigins, ["http://localhost:3000"]);
    assert.equal(policy.allowLiveOrigins, undefined);
  });

  it("requires an explicit flag for live origins", () => {
    assert.throws(
      () =>
        normalizeDemoAgentPolicy({
          ...basePolicy,
          allowedOrigins: ["https://example.com"],
        }),
      /live origins are explicitly enabled/,
    );
  });

  it("allows live origins when explicitly enabled", () => {
    const policy = normalizeDemoAgentPolicy({
      ...basePolicy,
      allowLiveOrigins: true,
      allowedOrigins: ["https://example.com/app"],
    });

    assert.deepEqual(policy.allowedOrigins, ["https://example.com"]);
    assert.equal(policy.allowLiveOrigins, true);
  });

  it("disables uploads unless files are approved", () => {
    const policy = normalizeDemoAgentPolicy({
      ...basePolicy,
      allowFileUploads: true,
      allowedOrigins: ["http://localhost:3000"],
      approvedUploadFiles: [],
    });

    assert.equal(policy.allowFileUploads, false);
  });

  it("keeps uploads enabled when files are approved", () => {
    const policy = normalizeDemoAgentPolicy({
      ...basePolicy,
      allowFileUploads: true,
      allowedOrigins: ["http://localhost:3000"],
      approvedUploadFiles: ["fixtures/demo.mp4"],
    });

    assert.equal(policy.allowFileUploads, true);
    assert.match(policy.approvedUploadFiles[0], /fixtures\/demo\.mp4$/);
  });

  it("clamps risky action and recording limits", () => {
    const policy = normalizeDemoAgentPolicy({
      ...basePolicy,
      allowedOrigins: ["http://localhost:3000"],
      maxActions: 500,
      maxRecordingSeconds: 2,
    });

    assert.equal(policy.maxActions, 200);
    assert.equal(policy.maxRecordingSeconds, 10);
  });
});
