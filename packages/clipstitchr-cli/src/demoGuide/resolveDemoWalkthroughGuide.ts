import { stat } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { createDemoWalkthroughGuideFileName } from "./createDemoWalkthroughGuideFileName.js";
import { createDemoWalkthroughGuideAmbiguousNameError } from "./createDemoWalkthroughGuideAmbiguousNameError.js";
import { getDemoWalkthroughGuidesDirectoryPath } from "./getDemoWalkthroughGuidesDirectoryPath.js";
import { getDemoWalkthroughGuideMatchesName } from "./getDemoWalkthroughGuideMatchesName.js";
import { listDemoWalkthroughGuides } from "./listDemoWalkthroughGuides.js";
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
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const nameMatches = (await listDemoWalkthroughGuides(cwd)).filter((guide) =>
    getDemoWalkthroughGuideMatchesName(guide, reference),
  );

  if (nameMatches.length > 1) {
    throw createDemoWalkthroughGuideAmbiguousNameError(reference, nameMatches);
  }

  return nameMatches[0] ?? null;
}
