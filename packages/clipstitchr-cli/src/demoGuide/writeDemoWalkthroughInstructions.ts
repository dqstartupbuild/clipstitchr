import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { createDemoWalkthroughInstructions } from "./createDemoWalkthroughInstructions.js";
import { getDemoWalkthroughGuidesDirectoryPath } from "./getDemoWalkthroughGuidesDirectoryPath.js";

export async function writeDemoWalkthroughInstructions(
  guide: DemoWalkthroughGuide,
  outputPath = join(
    getDemoWalkthroughGuidesDirectoryPath(),
    `${guide.id}-agent-instructions.md`,
  ),
) {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, createDemoWalkthroughInstructions(guide), "utf8");

  return outputPath;
}
