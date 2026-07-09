import { stat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { createDemoWalkthroughGuideAmbiguousNameError } from "./createDemoWalkthroughGuideAmbiguousNameError.js";
import { getDemoWalkthroughGuideFilePath } from "./getDemoWalkthroughGuideFilePath.js";
import { getDemoWalkthroughGuideMatchesName } from "./getDemoWalkthroughGuideMatchesName.js";
import { readDemoWalkthroughGuideEntries } from "./readDemoWalkthroughGuideEntries.js";

export async function resolveDemoWalkthroughGuidePath(
  reference: string,
  cwd = process.cwd(),
) {
  const directPath = isAbsolute(reference) ? reference : resolve(cwd, reference);

  try {
    await stat(directPath);

    return directPath;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const savedPath = getDemoWalkthroughGuideFilePath({ id: reference }, cwd);

  try {
    await stat(savedPath);

    return savedPath;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const nameMatches = (await readDemoWalkthroughGuideEntries(cwd)).filter(
    (entry) => getDemoWalkthroughGuideMatchesName(entry.guide, reference),
  );

  if (nameMatches.length > 1) {
    throw createDemoWalkthroughGuideAmbiguousNameError(
      reference,
      nameMatches.map((entry) => entry.guide),
    );
  }

  return nameMatches[0]?.path ?? null;
}
