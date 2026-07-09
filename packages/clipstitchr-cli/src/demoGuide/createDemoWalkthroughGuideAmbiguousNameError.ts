import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";

export function createDemoWalkthroughGuideAmbiguousNameError(
  reference: string,
  matches: DemoWalkthroughGuide[],
) {
  return new Error(
    [
      `More than one walkthrough guide is named "${reference}".`,
      "Use one of these guide IDs instead:",
      ...matches.map((guide) => `- ${guide.name}: ${guide.id}`),
    ].join("\n"),
  );
}
