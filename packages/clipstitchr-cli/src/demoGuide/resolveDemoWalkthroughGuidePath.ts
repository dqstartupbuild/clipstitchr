import { stat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { getDemoWalkthroughGuideFilePath } from "./getDemoWalkthroughGuideFilePath.js";

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
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
