import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { DemoAgentRunSummary } from "./DemoAgentRunSummary.js";
import { getDemoAgentRunsDirectoryPath } from "./getDemoAgentRunsDirectoryPath.js";

export async function readDemoAgentRunSummary(
  runId: string,
  cwd = process.cwd(),
) {
  const runSummaryPath = join(
    getDemoAgentRunsDirectoryPath(cwd),
    runId,
    "run-summary.json",
  );

  return JSON.parse(await readFile(runSummaryPath, "utf8")) as DemoAgentRunSummary;
}
