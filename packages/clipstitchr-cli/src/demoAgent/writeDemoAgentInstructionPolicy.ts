import { writeFile } from "node:fs/promises";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";

export async function writeDemoAgentInstructionPolicy(
  outputPath: string,
  policy: DemoAgentPolicy,
) {
  await writeFile(outputPath, `${JSON.stringify(policy, null, 2)}\n`, "utf8");

  return outputPath;
}
