import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { filterDemoWalkthroughGuidesForProduct } from "../demoGuide/filterDemoWalkthroughGuidesForProduct.js";
import { listDemoWalkthroughGuides } from "../demoGuide/listDemoWalkthroughGuides.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";

type DemoGuideListOptions = CliGlobalOptions & {
  all?: boolean;
};

export async function runDemoGuideListCommand(options: DemoGuideListOptions) {
  logBrandHeader("Walkthrough guides");

  const config = await readProjectConfig();
  const guides =
    options.all || !config.productId
      ? await listDemoWalkthroughGuides()
      : filterDemoWalkthroughGuidesForProduct(
          await listDemoWalkthroughGuides(),
          config.productId,
        );

  if (!guides.length) {
    logInfo("No saved walkthrough guides yet.");
    return;
  }

  for (const guide of guides) {
    logKeyValue(guide.name, `${guide.title} - ${guide.id} (${guide.source})`);
  }
}
