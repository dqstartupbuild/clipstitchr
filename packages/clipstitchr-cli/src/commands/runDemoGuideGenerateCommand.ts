import { join } from "node:path";
import { input, select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "./CliGlobalOptions.js";
import { ensureCredentialsOrLogin } from "./ensureCredentialsOrLogin.js";
import { generateDemoWalkthroughGuide } from "../api/generateDemoWalkthroughGuide.js";
import { readProjectConfig } from "../config/readProjectConfig.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import { writeProjectConfig } from "../config/writeProjectConfig.js";
import { createProductConfigSummary } from "../config/createProductConfigSummary.js";
import { createDemoWalkthroughGuide } from "../demoGuide/createDemoWalkthroughGuide.js";
import { editDemoWalkthroughGuide } from "../demoGuide/editDemoWalkthroughGuide.js";
import { printDemoWalkthroughGuide } from "../demoGuide/printDemoWalkthroughGuide.js";
import { readDemoWalkthroughGuideStepCountInput } from "../demoGuide/readDemoWalkthroughGuideStepCountInput.js";
import { writeDemoWalkthroughGuide } from "../demoGuide/writeDemoWalkthroughGuide.js";
import { selectProduct } from "../interactive/selectProduct.js";
import { detectProject } from "../project/detectProject.js";
import { createAppContextConfig } from "../project/createAppContextConfig.js";
import { scanAndWriteAppContext } from "../project/scanAndWriteAppContext.js";
import type { ScannedFlow } from "../project/ScannedFlow.js";
import { scanProjectFlows } from "../project/scanProjectFlows.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSuccess } from "../terminal/logSuccess.js";
import { logWarning } from "../terminal/logWarning.js";

type DemoGuideGenerateOptions = CliGlobalOptions & {
  product?: string;
};

export async function runDemoGuideGenerateCommand(
  options: DemoGuideGenerateOptions,
) {
  logBrandHeader("Create an AI walkthrough guide");

  const config = await readProjectConfig();
  const apiBaseUrl = resolveApiBaseUrl(config, options.api);
  const credentials = await ensureCredentialsOrLogin(apiBaseUrl);
  const project = await detectProject();
  const product = await selectProduct(
    credentials,
    options.product ?? config.productId,
  );
  const flows = await scanProjectFlows(join(process.cwd(), project.directory));
  const appContext = await scanAndWriteAppContext({ flows, project });
  const configWithAppContext = {
    ...config,
    appContext: createAppContextConfig(appContext),
  };
  await writeProjectConfig(configWithAppContext);
  const selectedFlow: ScannedFlow | undefined = flows.length
    ? await select({
        choices: [
          ...flows.slice(0, 8).map((flow) => ({
            name: `${flow.name}${flow.path ? ` (${flow.path})` : ""}`,
            value: flow,
          })),
          {
            name: "I will describe the flow",
            value: undefined,
          },
        ],
        message: "Which flow should this guide cover?",
      })
    : undefined;
  const defaultGoal = selectedFlow?.name ?? "Show the main product flow";
  const goal = await input({
    default: defaultGoal,
    message: "What should this demo show?",
  });
  const targetAudience = await input({
    default: `people evaluating ${product.name}`,
    message: "Who is watching this demo?",
  });
  const stepCount = readDemoWalkthroughGuideStepCountInput(
    await input({
      default: "5",
      message: "How many guide steps? (3-8)",
    }),
  );
  let shouldRegenerate = true;

  while (shouldRegenerate) {
    shouldRegenerate = false;

    const guide = await generateDemoWalkthroughGuide(credentials, {
      appContext,
      appType: project.type,
      availableFlows: flows,
      flowName: selectedFlow?.name,
      flowPath: selectedFlow?.path,
      goal: goal.trim() || defaultGoal,
      productId: product.id,
      stepCount,
      targetAudience: targetAudience.trim() || `people evaluating ${product.name}`,
    })
      .then((response) => response.guide)
      .catch(async (error) => {
        logWarning(
          error instanceof Error
            ? error.message
            : "The AI guide was not available.",
        );
        logInfo("Using a simple local checklist instead.");

        return createDemoWalkthroughGuide({
          flow: selectedFlow,
          goal: goal.trim() || defaultGoal,
          product,
          project,
        });
      });

    printDemoWalkthroughGuide(guide);

    const action = await select({
      choices: [
        {
          name: "Save and use for the next recording",
          value: "use",
        },
        {
          name: "Edit step labels before saving",
          value: "edit",
        },
        {
          name: "Regenerate",
          value: "regenerate",
        },
        {
          name: "Save without making it the default",
          value: "save",
        },
        {
          name: "Discard",
          value: "discard",
        },
      ],
      message: "What do you want to do with this guide?",
    });

    if (action === "regenerate") {
      shouldRegenerate = true;
      continue;
    }

    if (action === "discard") {
      logInfo("Did not save the guide.");
      return;
    }

    const savedGuide =
      action === "edit" ? await editDemoWalkthroughGuide(guide) : guide;
    const guidePath = await writeDemoWalkthroughGuide(savedGuide);

    if (action === "use" || action === "edit") {
      await writeProjectConfig({
        ...configWithAppContext,
        apiBaseUrl,
        product: createProductConfigSummary(product),
        productId: product.id,
        recording: {
          ...config.recording,
          demoGuideId: savedGuide.id,
        },
        target: {
          ...config.target,
          type: project.type,
        },
      });
      logSuccess("Saved this guide for the next recording.");
    } else {
      logSuccess("Saved walkthrough guide.");
    }

    logKeyValue("Guide ID", savedGuide.id);
    logKeyValue("File", guidePath);
    logInfo(`Record with clipstitchr demo manual --guide ${savedGuide.id}`);
  }
}
