import { stat } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { createDemoWalkthroughGuideFileName } from "./createDemoWalkthroughGuideFileName.js";
import { getDemoWalkthroughGuidesDirectoryPath } from "./getDemoWalkthroughGuidesDirectoryPath.js";
import { readDemoWalkthroughGuide } from "./readDemoWalkthroughGuide.js";

export async function resolveDemoWalkthroughGuide(
  reference: string,
  cwd = process.cwd(),
) {
  const directPath = isAbsolute(reference) ? reference : resolve(cwd, reference);

  try {
    await stat(directPath);

    return await readDemoWalkthroughGuide(directPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const savedPath = join(
    getDemoWalkthroughGuidesDirectoryPath(cwd),
    createDemoWalkthroughGuideFileName({ id: reference }),
  );

  try {
    return await readDemoWalkthroughGuide(savedPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
