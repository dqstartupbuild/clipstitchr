import { resolve } from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DemoAgentAction } from "../../src/demoAgent/DemoAgentAction.js";
import { validateDemoAgentAction } from "../../dist/demoAgent/validateDemoAgentAction.js";
import { createDemoAgentTestPolicy } from "./createDemoAgentTestPolicy.js";

const currentUrl = "http://localhost:3000/dashboard";
const guideStepIds = ["step-1", "step-2"];

function validateAction(action: DemoAgentAction) {
  return validateDemoAgentAction({
    action,
    currentStepId: "step-1",
    currentUrl,
    guideStepIds,
    policy: createDemoAgentTestPolicy(),
  });
}

describe("validateDemoAgentAction", () => {
  it("approves visible click targets", () => {
    const action = validateAction({
      stepId: "step-1",
      target: { name: "Upload", role: "button" },
      type: "click",
    });

    assert.equal(action.type, "click");
  });

  it("rejects click actions that only provide a selector", () => {
    assert.throws(
      () =>
        validateAction({
          target: { selector: "#danger" },
          type: "click",
        } as unknown as DemoAgentAction),
      /user-visible target/,
    );
  });

  it("rejects blocked action text", () => {
    assert.throws(
      () =>
        validateAction({
          stepId: "step-1",
          target: { name: "Delete account", role: "button" },
          type: "click",
        }),
      /blocked action: delete/,
    );
  });

  it("rejects navigation outside the allowed local origin", () => {
    assert.throws(
      () =>
        validateAction({
          path: "https://example.com/dashboard",
          type: "navigate",
        }),
      /cannot leave/,
    );
  });

  it("rejects navigation outside allowed local routes", () => {
    assert.throws(
      () =>
        validateAction({
          path: "/settings",
          type: "navigate",
        }),
      /cannot use route/,
    );
  });

  it("resolves approved test values for typing", () => {
    const action = validateAction({
      stepId: "step-1",
      target: { label: "Email" },
      type: "type",
      valueKey: "testEmail",
    });

    assert.equal(action.type, "type");
    assert.equal(action.resolvedValue, "demo@example.com");
  });

  it("rejects unapproved typed values", () => {
    assert.throws(
      () =>
        validateAction({
          stepId: "step-1",
          target: { label: "Email" },
          type: "type",
          valueKey: "realCustomerEmail",
        }),
      /approved test values/,
    );
  });

  it("rejects uploads while pre-upload approval is still required", () => {
    assert.throws(
      () =>
        validateAction({
          fileKey: "demo-sample.mp4",
          target: { label: "Video" },
          type: "uploadFile",
        }),
      /explicit policy approval/,
    );
  });

  it("resolves exactly one approved upload file after policy approval", () => {
    const approvedFile = resolve(process.cwd(), "fixtures/demo-sample.mp4");
    const action = validateDemoAgentAction({
      action: {
        fileKey: "demo-sample.mp4",
        target: { label: "Video" },
        type: "uploadFile",
      },
      currentUrl,
      guideStepIds,
      policy: createDemoAgentTestPolicy({
        approvedUploadFiles: [approvedFile],
        requiresApprovalBeforeUpload: false,
      }),
    });

    assert.equal(action.type, "uploadFile");
    assert.equal(action.resolvedFilePath, approvedFile);
  });

  it("rejects finishing the wrong guide step", () => {
    assert.throws(
      () =>
        validateAction({
          stepId: "step-2",
          type: "finishStep",
        }),
      /wrong guide step/,
    );
  });
});
