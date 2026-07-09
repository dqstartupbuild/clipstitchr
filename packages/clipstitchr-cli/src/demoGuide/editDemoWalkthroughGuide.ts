import { confirm, input } from "@inquirer/prompts";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { createDemoWalkthroughGuideName } from "./createDemoWalkthroughGuideName.js";

export async function editDemoWalkthroughGuide(
  guide: DemoWalkthroughGuide,
): Promise<DemoWalkthroughGuide> {
  const title = await input({
    default: guide.title,
    message: "Guide title:",
  });
  const name = await input({
    default: guide.name,
    message: "Guide name:",
  });
  const goal = await input({
    default: guide.goal,
    message: "What should this demo show?",
  });
  const editedLabels: string[] = [];

  for (const [index, step] of guide.steps.entries()) {
    const label = await input({
      default: step.label,
      message: `Step ${index + 1} label (type - to remove):`,
    });

    if (label.trim() && label.trim() !== "-") {
      editedLabels.push(label.trim());
    }
  }

  let shouldAddStep = await confirm({
    default: false,
    message: "Add another step?",
  });

  while (shouldAddStep) {
    const label = await input({
      message: `Step ${editedLabels.length + 1} label:`,
    });

    if (label.trim()) {
      editedLabels.push(label.trim());
    }

    shouldAddStep = await confirm({
      default: false,
      message: "Add another step?",
    });
  }

  if (!editedLabels.length) {
    throw new Error("A walkthrough guide needs at least one step.");
  }

  return {
    ...guide,
    goal: goal.trim() || guide.goal,
    name:
      createDemoWalkthroughGuideName({ title: name }) ||
      createDemoWalkthroughGuideName({ goal: goal.trim() || guide.goal }),
    steps: editedLabels.map((label, index) => ({
      id: `step-${index + 1}`,
      label,
    })),
    title: title.trim() || guide.title,
    updatedAt: new Date().toISOString(),
  };
}
