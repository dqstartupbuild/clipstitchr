import type { DemoAgentRecordedRun } from "../../src/demoAgent/DemoAgentRecordedRun.js";
import type { DemoAgentRunSummary } from "../../src/demoAgent/DemoAgentRunSummary.js";
import { demoAgentGuideCompleteStopReason } from "../../dist/demoAgent/demoAgentGuideCompleteStopReason.js";

export function createDemoAgentTestRecordedRun(
  summaryOverrides: Partial<DemoAgentRunSummary> = {},
): DemoAgentRecordedRun {
  const timestamp = new Date("2026-01-01T00:00:00.000Z").toISOString();
  const summary: DemoAgentRunSummary = {
    actionCount: 4,
    allowedOrigins: ["http://localhost:3000"],
    approvedForUpload: false,
    endedAt: timestamp,
    guideId: "guide_fixture",
    guideSource: "cli-template",
    id: "agent_run_fixture",
    mode: "guided-browser",
    policyHash: "policy-hash",
    recordingPath: "/tmp/clipstitchr-agent-fixture.mp4",
    runDirectory: "/tmp/clipstitchr-agent-run",
    screenshotCount: 2,
    startUrl: "http://localhost:3000/dashboard",
    startedAt: timestamp,
    stepTimings: [],
    stopReason: demoAgentGuideCompleteStopReason,
    uploaded: false,
    ...summaryOverrides,
  };

  return {
    interactionEvents: [
      {
        timestampMs: 100,
        type: "click",
        viewportHeight: 720,
        viewportWidth: 1280,
        x: 40,
        y: 80,
      },
    ],
    rawVideoPath: "/tmp/clipstitchr-agent-fixture.webm",
    runSummaryPath: "/tmp/clipstitchr-agent-run/run-summary.json",
    summary,
  };
}
