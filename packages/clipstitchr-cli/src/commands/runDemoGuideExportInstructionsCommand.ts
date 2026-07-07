import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { resolveDemoWalkthroughGuide } from "../demoGuide/resolveDemoWalkthroughGuide.js";
import { writeDemoWalkthroughInstructions } from "../demoGuide/writeDemoWalkthroughInstructions.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";

type DemoGuideExportInstructionsOptions = CliGlobalOptions & {
  output?: string;
};

export async function runDemoGuideExportInstructionsCommand(
  reference: string,
  options: DemoGuideExportInstructionsOptions,
) {
  logBrandHeader("Export guide instructions");

  const guide = await resolveDemoWalkthroughGuide(reference);

  if (!guide) {
    throw new Error(`No walkthrough guide found for ${reference}.`);
  }

  const outputPath = await writeDemoWalkthroughInstructions(
    guide,
    options.output,
  );

  logSuccess("Exported guide instructions.");
  logKeyValue("File", outputPath);
}
