import { join } from "node:path";
import type { DemoAgentRunPaths } from "./DemoAgentRunPaths.js";
import { getDemoAgentRunsDirectoryPath } from "./getDemoAgentRunsDirectoryPath.js";

export function createDemoAgentRunPaths(
  runId: string,
  cwd = process.cwd(),
): DemoAgentRunPaths {
  const runDirectory = join(getDemoAgentRunsDirectoryPath(cwd), runId);

  return {
    actionLogPath: join(runDirectory, "action-log.jsonl"),
    recordingPath: join(runDirectory, "recording.mp4"),
    runDirectory,
    runSummaryPath: join(runDirectory, "run-summary.json"),
    screenshotsDirectory: join(runDirectory, "screenshots"),
  };
}
