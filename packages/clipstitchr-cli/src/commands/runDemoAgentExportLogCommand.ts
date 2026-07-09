import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { getDemoAgentRunsDirectoryPath } from "../demoAgent/getDemoAgentRunsDirectoryPath.js";
import { readDemoAgentRunSummary } from "../demoAgent/readDemoAgentRunSummary.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";

type DemoAgentExportLogOptions = CliGlobalOptions & {
  output?: string;
};

export async function runDemoAgentExportLogCommand(
  runId: string,
  options: DemoAgentExportLogOptions,
) {
  logBrandHeader("Demo agent logs");

  const summary = await readDemoAgentRunSummary(runId);
  const actionLogPath = join(
    getDemoAgentRunsDirectoryPath(),
    runId,
    "action-log.jsonl",
  );

  if (!options.output) {
    logKeyValue("Summary", join(summary.runDirectory, "run-summary.json"));
    logKeyValue("Action log", actionLogPath);
    logKeyValue("Screenshots", join(summary.runDirectory, "screenshots"));
    return;
  }

  const actionLog = await readFile(actionLogPath, "utf8");

  await writeFile(
    options.output,
    `${JSON.stringify({ actionLog, summary }, null, 2)}\n`,
    "utf8",
  );
  logSuccess("Saved local agent log.");
  logKeyValue("File", options.output);
}
