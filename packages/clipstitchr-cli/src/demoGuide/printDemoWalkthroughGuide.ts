import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSection } from "../terminal/logSection.js";
import { ensureDemoWalkthroughGuideName } from "./ensureDemoWalkthroughGuideName.js";

export function printDemoWalkthroughGuide(guide: DemoWalkthroughGuide) {
  const guideWithName = ensureDemoWalkthroughGuideName(guide);

  logSection("Demo walkthrough");
  logKeyValue("Name", guideWithName.name);
  logKeyValue("Goal", guideWithName.goal);

  guideWithName.steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step.label}`);
  });
}
