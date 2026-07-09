import type { DemoAgentRunPaths } from "./DemoAgentRunPaths.js";
import { createDemoAgentActionLogEntry } from "./createDemoAgentActionLogEntry.js";
import type { OpenAiComputerSurfaceAdapter } from "./OpenAiComputerSurfaceAdapter.js";
import { writeDemoAgentActionLogEntry } from "./writeDemoAgentActionLogEntry.js";

export async function writeOpenAiComputerSurfaceLoopStopEntry(input: {
  runPaths: Pick<DemoAgentRunPaths, "actionLogPath">;
  stepId?: string;
  stopReason: string;
  surface: Pick<OpenAiComputerSurfaceAdapter, "getLocation">;
}) {
  const location = input.surface.getLocation();

  await writeDemoAgentActionLogEntry(
    input.runPaths.actionLogPath,
    createDemoAgentActionLogEntry({
      action: "stop",
      details: {
        driver: "openai-computer",
        policyDecision: "approved",
        urlAfter: location,
        urlBefore: location,
      },
      result: "stopped",
      stepId: input.stepId,
      stopReason: input.stopReason,
      url: location,
    }),
  );
}
