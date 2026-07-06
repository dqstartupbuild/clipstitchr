import { detectProject } from "../project/detectProject.js";
import { scanProjectFlows } from "../project/scanProjectFlows.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSection } from "../terminal/logSection.js";

export async function runScanCommand() {
  logBrandHeader("Find demo flows");

  const project = await detectProject();
  const flows = await scanProjectFlows();

  logKeyValue("Detected", project.type);
  logKeyValue("Start command", project.startCommand ?? "not found");

  if (!flows.length) {
    logInfo("No obvious flows found yet.");
    return;
  }

  logSection("Possible demo flows");

  for (const [index, flow] of flows.entries()) {
    console.log(`${index + 1}. ${flow.name}${flow.path ? ` (${flow.path})` : ""}`);
  }
}
