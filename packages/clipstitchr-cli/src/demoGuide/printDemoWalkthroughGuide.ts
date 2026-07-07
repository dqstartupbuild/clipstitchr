import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSection } from "../terminal/logSection.js";

export function printDemoWalkthroughGuide(guide: DemoWalkthroughGuide) {
  logSection("Demo walkthrough");
  logKeyValue("Goal", guide.goal);

  guide.steps.forEach((step, index) => {
    console.log(`${index + 1}. ${step.label}`);
  });
}
