import { confirm, input, select } from "@inquirer/prompts";
import type { ProductSummary } from "../api/ProductSummary.js";
import type { DetectedProject } from "../project/DetectedProject.js";
import type { ScannedFlow } from "../project/ScannedFlow.js";
import { logInfo } from "../terminal/logInfo.js";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { createDemoWalkthroughGuide } from "./createDemoWalkthroughGuide.js";
import { listDemoWalkthroughGuides } from "./listDemoWalkthroughGuides.js";
import { resolveDemoWalkthroughGuide } from "./resolveDemoWalkthroughGuide.js";
import { writeDemoWalkthroughGuide } from "./writeDemoWalkthroughGuide.js";

type SelectDemoWalkthroughGuideOptions = {
  configGuideId?: string;
  disabled?: boolean;
  guideReference?: string;
  product: ProductSummary;
  project: Pick<DetectedProject, "type">;
  selectedFlow?: ScannedFlow;
};

export async function selectDemoWalkthroughGuide(
  options: SelectDemoWalkthroughGuideOptions,
): Promise<DemoWalkthroughGuide | undefined> {
  if (options.disabled) {
    return undefined;
  }

  if (options.guideReference) {
    const guide = await resolveDemoWalkthroughGuide(options.guideReference);

    if (!guide) {
      throw new Error(`No walkthrough guide found for ${options.guideReference}.`);
    }

    return guide;
  }

  const guides = await listDemoWalkthroughGuides();
  const lastGuide = options.configGuideId
    ? guides.find((guide) => guide.id === options.configGuideId)
    : undefined;

  if (lastGuide) {
    const action = await select({
      choices: [
        {
          name: `Use saved guide: ${lastGuide.title}`,
          value: lastGuide.id,
        },
        {
          name: "Create a new guide",
          value: "create",
        },
        {
          name: "Record without a guide",
          value: "skip",
        },
      ],
      message: "Use a walkthrough guide for this recording?",
    });

    if (action === "skip") {
      return undefined;
    }

    if (action !== "create") {
      return lastGuide;
    }
  } else if (guides.length) {
    const action = await select({
      choices: [
        ...guides.slice(0, 5).map((guide) => ({
          name: `Use ${guide.title}`,
          value: guide.id,
        })),
        {
          name: "Create a new guide",
          value: "create",
        },
        {
          name: "Record without a guide",
          value: "skip",
        },
      ],
      message: "Use a walkthrough guide for this recording?",
    });

    if (action === "skip") {
      return undefined;
    }

    if (action !== "create") {
      return guides.find((guide) => guide.id === action);
    }
  } else {
    const shouldCreateGuide = await confirm({
      default: true,
      message: "Create a quick walkthrough checklist before recording?",
    });

    if (!shouldCreateGuide) {
      return undefined;
    }
  }

  const goal = await input({
    default: options.selectedFlow?.name ?? "Show the main product flow",
    message: "What do you want this demo to show?",
  });
  const guide = createDemoWalkthroughGuide({
    flow: options.selectedFlow,
    goal,
    product: options.product,
    project: options.project,
  });
  const guidePath = await writeDemoWalkthroughGuide(guide);

  logInfo(`Saved walkthrough guide to ${guidePath}`);

  return guide;
}
