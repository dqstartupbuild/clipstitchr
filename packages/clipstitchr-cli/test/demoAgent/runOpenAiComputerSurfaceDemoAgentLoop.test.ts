import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runOpenAiComputerSurfaceDemoAgentLoop } from "../../dist/demoAgent/runOpenAiComputerSurfaceDemoAgentLoop.js";
import { createDemoAgentTestGuide } from "./createDemoAgentTestGuide.js";
import { createDemoAgentTestPolicy } from "./createDemoAgentTestPolicy.js";
import { readDemoAgentTestActionLogEntries } from "./readDemoAgentTestActionLogEntries.js";
import { withDemoAgentRunPaths } from "./withDemoAgentRunPaths.js";

describe("runOpenAiComputerSurfaceDemoAgentLoop", () => {
  it("treats a response without a computer call as guide-complete progress", async () => {
    await withDemoAgentRunPaths(async (runPaths) => {
      const result = await runOpenAiComputerSurfaceDemoAgentLoop({
        guide: createDemoAgentTestGuide([
          { id: "step-1", label: "Show the selected window" },
        ]),
        model: "gpt-5.5",
        policy: createDemoAgentTestPolicy({
          allowedOrigins: ["macos-window://local"],
          allowedRoutes: ["/"],
        }),
        requester: async () => ({ id: "resp_1", output: [] }),
        runPaths,
        startedAtMs: Date.now(),
        surface: {
          captureScreenshot: async () => {
            throw new Error("No screenshot expected.");
          },
          executeAction: async () => undefined,
          getLocation: () => "macos-window://local/Test",
          validateState: async () => ({ ok: true }),
          waitForActionToSettle: async () => undefined,
        },
      });
      const entries = await readDemoAgentTestActionLogEntries(
        runPaths.actionLogPath,
      );

      assert.equal(result.stopReason, "guide-complete");
      assert.equal(result.stepTimings.length, 1);
      assert.deepEqual(
        entries.map((entry) => entry.action),
        ["finishStep"],
      );
    });
  });
});
