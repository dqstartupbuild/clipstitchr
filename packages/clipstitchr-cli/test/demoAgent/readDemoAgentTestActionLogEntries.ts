import { readFile } from "node:fs/promises";
import type { DemoAgentActionLogEntry } from "../../src/demoAgent/DemoAgentActionLogEntry.js";

export async function readDemoAgentTestActionLogEntries(
  actionLogPath: string,
): Promise<DemoAgentActionLogEntry[]> {
  const content = await readFile(actionLogPath, "utf8");

  return content
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as DemoAgentActionLogEntry);
}
