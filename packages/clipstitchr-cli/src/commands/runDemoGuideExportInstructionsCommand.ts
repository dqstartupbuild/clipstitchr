import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { readDemoAgentPolicy } from "../demoAgent/readDemoAgentPolicy.js";
import { writeDemoAgentInstructionPolicy } from "../demoAgent/writeDemoAgentInstructionPolicy.js";
import { createDemoWalkthroughInstructionPolicyPath } from "../demoGuide/createDemoWalkthroughInstructionPolicyPath.js";
import { resolveDemoWalkthroughGuide } from "../demoGuide/resolveDemoWalkthroughGuide.js";
import { writeDemoWalkthroughInstructions } from "../demoGuide/writeDemoWalkthroughInstructions.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { logWarning } from "../terminal/logWarning.js";

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
  let policyPath: string | undefined;

  try {
    const { policy } = await readDemoAgentPolicy();

    policyPath = await writeDemoAgentInstructionPolicy(
      createDemoWalkthroughInstructionPolicyPath(outputPath),
      policy,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      logWarning(
        "No local agent policy found. Run `clipstitchr demo agent init` to export one with the instructions.",
      );
    } else {
      throw error;
    }
  }

  logSuccess("Exported guide instructions.");
  logKeyValue("File", outputPath);

  if (policyPath) {
    logKeyValue("Policy", policyPath);
  }
}
