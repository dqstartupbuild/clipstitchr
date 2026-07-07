import { appendFile } from "node:fs/promises";
import type { DemoAgentActionLogEntry } from "./DemoAgentActionLogEntry.js";

export async function writeDemoAgentActionLogEntry(
  actionLogPath: string,
  entry: DemoAgentActionLogEntry,
) {
  await appendFile(actionLogPath, `${JSON.stringify(entry)}\n`, "utf8");
}
