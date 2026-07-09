import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reviewDemoAgentRecordingUpload } from "../../dist/commands/reviewDemoAgentRecordingUpload.js";
import { createDemoAgentTestGuide } from "./createDemoAgentTestGuide.js";
import { createDemoAgentTestRecordedRun } from "./createDemoAgentTestRecordedRun.js";
import { createDemoAgentUploadReviewTestServices } from "./createDemoAgentUploadReviewTestServices.js";

describe("reviewDemoAgentRecordingUpload", () => {
  it("skips upload when the agent stopped before finishing the guide", async () => {
    const { services, state } = createDemoAgentUploadReviewTestServices({
      approvedForUpload: true,
    });
    const result = await reviewDemoAgentRecordingUpload(
      {
        apiBaseUrl: "https://example.test",
        guide: createDemoAgentTestGuide([{ id: "step-1", label: "Dashboard" }]),
        recording: createDemoAgentTestRecordedRun({
          stopReason: "blocked-page-state",
        }),
      },
      services,
    );

    assert.deepEqual(result, {
      approvedForUpload: false,
      skippedReason: "incomplete-run",
      uploaded: false,
    });
    assert.equal(state.confirmationCount, 0);
    assert.equal(state.ensuredCredentialsCount, 0);
    assert.equal(state.uploadInputs.length, 0);
    assert.equal(state.summaries.length, 0);
    assert.match(state.logs.join("\n"), /demo upload/);
  });

  it("skips upload when the run command disables upload", async () => {
    const { services, state } = createDemoAgentUploadReviewTestServices({
      approvedForUpload: true,
    });
    const result = await reviewDemoAgentRecordingUpload(
      {
        apiBaseUrl: "https://example.test",
        guide: createDemoAgentTestGuide([{ id: "step-1", label: "Dashboard" }]),
        recording: createDemoAgentTestRecordedRun(),
        upload: false,
      },
      services,
    );

    assert.deepEqual(result, {
      approvedForUpload: false,
      skippedReason: "upload-disabled",
      uploaded: false,
    });
    assert.equal(state.confirmationCount, 0);
    assert.equal(state.ensuredCredentialsCount, 0);
    assert.equal(state.uploadInputs.length, 0);
    assert.equal(state.summaries.length, 0);
    assert.match(state.logs.join("\n"), /demo upload/);
  });

  it("writes review state and skips upload when approval is declined", async () => {
    const { services, state } = createDemoAgentUploadReviewTestServices({
      approvedForUpload: false,
    });
    const result = await reviewDemoAgentRecordingUpload(
      {
        apiBaseUrl: "https://example.test",
        guide: createDemoAgentTestGuide([{ id: "step-1", label: "Dashboard" }]),
        recording: createDemoAgentTestRecordedRun(),
      },
      services,
    );

    assert.deepEqual(result, {
      approvedForUpload: false,
      skippedReason: "approval-declined",
      uploaded: false,
    });
    assert.equal(state.confirmationCount, 1);
    assert.equal(state.ensuredCredentialsCount, 0);
    assert.equal(state.uploadInputs.length, 0);
    assert.equal(state.summaries.length, 1);
    assert.equal(state.summaries[0]?.approvedForUpload, false);
    assert.equal(state.summaries[0]?.uploaded, false);
  });

  it("uploads only after review approval and stores safe agent metadata", async () => {
    const { credentials, services, state } =
      createDemoAgentUploadReviewTestServices({
        approvedForUpload: true,
        productId: "product_approved",
      });
    const guide = createDemoAgentTestGuide([
      { id: "step-1", label: "Dashboard" },
    ]);
    const recording = createDemoAgentTestRecordedRun({
      actionCount: 7,
      screenshotCount: 3,
    });
    const result = await reviewDemoAgentRecordingUpload(
      {
        apiBaseUrl: "https://example.test",
        existingCredentials: credentials,
        guide,
        preferredProductId: "product_approved",
        recording,
      },
      services,
    );

    assert.deepEqual(result, {
      approvedForUpload: true,
      uploaded: true,
    });
    assert.equal(state.confirmationCount, 1);
    assert.equal(state.ensuredCredentialsCount, 0);
    assert.equal(state.uploadInputs.length, 1);
    assert.equal(state.uploadInputs[0]?.productId, "product_approved");
    assert.equal(
      state.uploadInputs[0]?.layout,
      "smart-screen-demo",
    );
    assert.equal(
      state.uploadInputs[0]?.walkthrough?.agentRun?.id,
      "agent_run_fixture",
    );
    assert.equal(
      state.uploadInputs[0]?.walkthrough?.agentRun?.approvedForUpload,
      true,
    );
    assert.equal(
      state.uploadInputs[0]?.walkthrough?.agentRun?.uploaded,
      true,
    );
    assert.equal(
      state.uploadInputs[0]?.walkthrough?.agentRun?.actionCount,
      7,
    );
    assert.equal(
      state.uploadInputs[0]?.walkthrough?.agentRun?.screenshotCount,
      3,
    );
    assert.equal(state.summaries.length, 2);
    assert.equal(state.summaries[0]?.approvedForUpload, true);
    assert.equal(state.summaries[0]?.uploaded, false);
    assert.equal(state.summaries[1]?.approvedForUpload, true);
    assert.equal(state.summaries[1]?.uploaded, true);
  });

  it("uploads without prompting when upload is already approved", async () => {
    const { credentials, services, state } =
      createDemoAgentUploadReviewTestServices({
        approvedForUpload: false,
        productId: "product_approved",
      });
    const result = await reviewDemoAgentRecordingUpload(
      {
        apiBaseUrl: "https://example.test",
        existingCredentials: credentials,
        guide: createDemoAgentTestGuide([
          { id: "step-1", label: "Dashboard" },
        ]),
        preferredProductId: "product_approved",
        recording: createDemoAgentTestRecordedRun(),
        upload: true,
      },
      services,
    );

    assert.deepEqual(result, {
      approvedForUpload: true,
      uploaded: true,
    });
    assert.equal(state.confirmationCount, 0);
    assert.equal(state.uploadInputs.length, 1);
  });
});
