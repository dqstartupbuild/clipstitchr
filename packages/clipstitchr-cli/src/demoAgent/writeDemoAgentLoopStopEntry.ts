import type { Page } from "playwright";
import type { DemoAgentRunPaths } from "./DemoAgentRunPaths.js";
import { createDemoAgentActionLogEntry } from "./createDemoAgentActionLogEntry.js";
import { writeDemoAgentActionLogEntry } from "./writeDemoAgentActionLogEntry.js";

export async function writeDemoAgentLoopStopEntry(input: {
  page: Page;
  runPaths: Pick<DemoAgentRunPaths, "actionLogPath">;
  stepId?: string;
  stopReason: string;
}) {
  const url = input.page.url();

  await writeDemoAgentActionLogEntry(
    input.runPaths.actionLogPath,
    createDemoAgentActionLogEntry({
      action: "stop",
      details: {
        policyDecision: "approved",
        urlAfter: url,
        urlBefore: url,
      },
      result: "stopped",
      stepId: input.stepId,
      stopReason: input.stopReason,
      url,
    }),
  );
}
