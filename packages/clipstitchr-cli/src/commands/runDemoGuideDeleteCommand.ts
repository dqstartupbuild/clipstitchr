import { confirm } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { deleteDemoWalkthroughGuide } from "../demoGuide/deleteDemoWalkthroughGuide.js";
import { resolveDemoWalkthroughGuide } from "../demoGuide/resolveDemoWalkthroughGuide.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logSuccess } from "../terminal/logSuccess.js";

type DemoGuideDeleteOptions = CliGlobalOptions & {
  yes?: boolean;
};

export async function runDemoGuideDeleteCommand(
  reference: string,
  options: DemoGuideDeleteOptions,
) {
  logBrandHeader("Delete walkthrough guide");

  const guide = await resolveDemoWalkthroughGuide(reference);

  if (!guide) {
    throw new Error(`No walkthrough guide found for ${reference}.`);
  }

  const shouldDelete =
    options.yes ??
    (await confirm({
      default: false,
      message: `Delete "${guide.title}"?`,
    }));

  if (!shouldDelete) {
    logInfo("Kept the guide.");
    return;
  }

  const deletedPath = await deleteDemoWalkthroughGuide(reference);

  if (!deletedPath) {
    throw new Error(`No walkthrough guide found for ${reference}.`);
  }

  const config = await readProjectConfig();

  if (config.recording?.demoGuideId === guide.id) {
    const { demoGuideId: _demoGuideId, ...recording } = config.recording;

    await writeProjectConfig({
      ...config,
      recording,
    });
  }

  logSuccess("Deleted walkthrough guide.");
}
