import { writeFile } from "node:fs/promises";
import type { DemoAgentRunSummary } from "./DemoAgentRunSummary.js";

export async function writeDemoAgentRunSummary(
  runSummaryPath: string,
  summary: DemoAgentRunSummary,
) {
  await writeFile(runSummaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}
