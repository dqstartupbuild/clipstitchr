import { unlink } from "node:fs/promises";
import { resolveDemoWalkthroughGuidePath } from "./resolveDemoWalkthroughGuidePath.js";

export async function deleteDemoWalkthroughGuide(reference: string) {
  const filePath = await resolveDemoWalkthroughGuidePath(reference);

  if (!filePath) {
    return null;
  }

  await unlink(filePath);

  return filePath;
}
