import { readFile } from "node:fs/promises";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";
import { demoWalkthroughGuideVersion } from "./demoWalkthroughGuideVersion.js";
import { readDemoWalkthroughGuideStep } from "./readDemoWalkthroughGuideStep.js";
import { readDemoWalkthroughGuideString } from "./readDemoWalkthroughGuideString.js";

export async function readDemoWalkthroughGuide(filePath: string) {
  const rawGuide = JSON.parse(await readFile(filePath, "utf8")) as unknown;

  if (
    !rawGuide ||
    typeof rawGuide !== "object" ||
    Array.isArray(rawGuide) ||
    !Array.isArray((rawGuide as DemoWalkthroughGuide).steps)
  ) {
    throw new Error(`Invalid walkthrough guide: ${filePath}`);
  }

  const guide = rawGuide as Record<string, unknown>;
  const id = readDemoWalkthroughGuideString(guide.id);
  const title = readDemoWalkthroughGuideString(guide.title);
  const goal = readDemoWalkthroughGuideString(guide.goal);
  const createdAt = readDemoWalkthroughGuideString(guide.createdAt);
  const updatedAt = readDemoWalkthroughGuideString(guide.updatedAt) ?? createdAt;
  const steps = (guide.steps as unknown[])
    .map(readDemoWalkthroughGuideStep)
    .filter((step): step is NonNullable<typeof step> => step !== null);

  if (!id || !title || !goal || !createdAt || !updatedAt || !steps.length) {
    throw new Error(`Invalid walkthrough guide: ${filePath}`);
  }

  return {
    appType: readDemoWalkthroughGuideString(guide.appType),
    createdAt,
    flowName: readDemoWalkthroughGuideString(guide.flowName),
    flowPath: readDemoWalkthroughGuideString(guide.flowPath),
    goal,
    id,
    productId: readDemoWalkthroughGuideString(guide.productId),
    productName: readDemoWalkthroughGuideString(guide.productName),
    source: "cli-template",
    steps,
    title,
    updatedAt,
    version: demoWalkthroughGuideVersion,
  } satisfies DemoWalkthroughGuide;
}
