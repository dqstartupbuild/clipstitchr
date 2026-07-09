import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { createDemoWalkthroughGuideFileName } from "./createDemoWalkthroughGuideFileName.js";
import { ensureDemoWalkthroughGuideName } from "./ensureDemoWalkthroughGuideName.js";
import { getDemoWalkthroughGuidesDirectoryPath } from "./getDemoWalkthroughGuidesDirectoryPath.js";

export async function writeDemoWalkthroughGuide(
  guide: DemoWalkthroughGuide,
  cwd = process.cwd(),
) {
  const directoryPath = getDemoWalkthroughGuidesDirectoryPath(cwd);
  const filePath = join(directoryPath, createDemoWalkthroughGuideFileName(guide));
  const guideWithName = ensureDemoWalkthroughGuideName(guide);

  await mkdir(directoryPath, { recursive: true });
  await writeFile(
    filePath,
    `${JSON.stringify(guideWithName, null, 2)}\n`,
    "utf8",
  );

  return filePath;
}
