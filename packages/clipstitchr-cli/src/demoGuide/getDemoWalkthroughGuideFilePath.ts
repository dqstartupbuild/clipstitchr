import { join } from "node:path";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { createDemoWalkthroughGuideFileName } from "./createDemoWalkthroughGuideFileName.js";
import { getDemoWalkthroughGuidesDirectoryPath } from "./getDemoWalkthroughGuidesDirectoryPath.js";

export function getDemoWalkthroughGuideFilePath(
  guide: Pick<DemoWalkthroughGuide, "id">,
  cwd = process.cwd(),
) {
  return join(
    getDemoWalkthroughGuidesDirectoryPath(cwd),
    createDemoWalkthroughGuideFileName(guide),
  );
}
