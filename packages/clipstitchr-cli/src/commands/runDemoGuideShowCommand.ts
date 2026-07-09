import { resolveDemoWalkthroughGuide } from "../demoGuide/resolveDemoWalkthroughGuide.js";
import { printDemoWalkthroughGuide } from "../demoGuide/printDemoWalkthroughGuide.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";

export async function runDemoGuideShowCommand(reference: string) {
  logBrandHeader("Walkthrough guide");

  const guide = await resolveDemoWalkthroughGuide(reference);

  if (!guide) {
    throw new Error(`No walkthrough guide found for ${reference}.`);
  }

  printDemoWalkthroughGuide(guide);
  logKeyValue("Guide ID", guide.id);
  logKeyValue("Guide name", guide.name);
  logKeyValue("Source", guide.source);

  if (guide.productName) {
    logKeyValue("Product", guide.productName);
  }
}
