import { detectProject } from "../project/detectProject.js";
import { scanProjectFlows } from "../project/scanProjectFlows.js";

export async function runScanCommand() {
  const project = await detectProject();
  const flows = await scanProjectFlows();

  console.log(`Detected: ${project.type}`);
  console.log(`Start command: ${project.startCommand ?? "not found"}`);

  if (!flows.length) {
    console.log("No obvious flows found yet.");
    return;
  }

  console.log("Possible demo flows:");

  for (const [index, flow] of flows.entries()) {
    console.log(`${index + 1}. ${flow.name}${flow.path ? ` (${flow.path})` : ""}`);
  }
}
