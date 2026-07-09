import { createDemoWalkthroughGuideSortValue } from "./createDemoWalkthroughGuideSortValue.js";
import { readDemoWalkthroughGuideEntries } from "./readDemoWalkthroughGuideEntries.js";

export async function listDemoWalkthroughGuides(cwd = process.cwd()) {
  return (await readDemoWalkthroughGuideEntries(cwd))
    .map((entry) => entry.guide)
    .sort(
      (a, b) =>
        createDemoWalkthroughGuideSortValue(b) -
        createDemoWalkthroughGuideSortValue(a),
    );
}
