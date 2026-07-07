import { editDemoWalkthroughGuide } from "../demoGuide/editDemoWalkthroughGuide.js";
import { resolveDemoWalkthroughGuide } from "../demoGuide/resolveDemoWalkthroughGuide.js";
import { writeDemoWalkthroughGuide } from "../demoGuide/writeDemoWalkthroughGuide.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runDemoGuideEditCommand(reference: string) {
  logBrandHeader("Edit walkthrough guide");

  const guide = await resolveDemoWalkthroughGuide(reference);

  if (!guide) {
    throw new Error(`No walkthrough guide found for ${reference}.`);
  }

  const editedGuide = await editDemoWalkthroughGuide(guide);
  const guidePath = await writeDemoWalkthroughGuide(editedGuide);

  logSuccess("Saved walkthrough guide.");
  logInfo(guidePath);
}
