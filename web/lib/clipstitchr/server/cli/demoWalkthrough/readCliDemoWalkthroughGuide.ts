import type { CliDemoWalkthroughGuide } from "./CliDemoWalkthroughGuide";
import { readCliDemoWalkthroughStep } from "./readCliDemoWalkthroughStep";
import { readCliDemoWalkthroughString } from "./readCliDemoWalkthroughString";

export function readCliDemoWalkthroughGuide(
  value: unknown,
): CliDemoWalkthroughGuide | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const rawGuide = value as Record<string, unknown>;
  const id = readCliDemoWalkthroughString(rawGuide.id, 120);
  const title = readCliDemoWalkthroughString(rawGuide.title, 160);
  const goal = readCliDemoWalkthroughString(rawGuide.goal, 500);
  const steps = Array.isArray(rawGuide.steps)
    ? rawGuide.steps
        .slice(0, 20)
        .map(readCliDemoWalkthroughStep)
        .filter((step): step is NonNullable<typeof step> => step !== null)
    : [];

  if (!id || !title || !goal || !steps.length) {
    return null;
  }

  return {
    appType: readCliDemoWalkthroughString(rawGuide.appType, 80),
    createdAt: readCliDemoWalkthroughString(rawGuide.createdAt, 80),
    flowName: readCliDemoWalkthroughString(rawGuide.flowName, 160),
    flowPath: readCliDemoWalkthroughString(rawGuide.flowPath, 500),
    goal,
    id,
    productId: readCliDemoWalkthroughString(rawGuide.productId, 160),
    productName: readCliDemoWalkthroughString(rawGuide.productName, 160),
    source: readCliDemoWalkthroughString(rawGuide.source, 80),
    steps,
    title,
    updatedAt: readCliDemoWalkthroughString(rawGuide.updatedAt, 80),
    version: typeof rawGuide.version === "number" ? rawGuide.version : undefined,
  };
}
