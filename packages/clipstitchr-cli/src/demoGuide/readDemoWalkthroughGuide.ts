import { readFile } from "node:fs/promises";
import type { DemoWalkthroughGuide } from "./DemoWalkthroughGuide.js";

export async function readDemoWalkthroughGuide(filePath: string) {
  const rawGuide = JSON.parse(await readFile(filePath, "utf8")) as unknown;

  if (
    !rawGuide ||
    typeof rawGuide !== "object" ||
    Array.isArray(rawGuide) ||
    typeof (rawGuide as DemoWalkthroughGuide).id !== "string" ||
    typeof (rawGuide as DemoWalkthroughGuide).title !== "string" ||
    typeof (rawGuide as DemoWalkthroughGuide).goal !== "string" ||
    !Array.isArray((rawGuide as DemoWalkthroughGuide).steps)
  ) {
    throw new Error(`Invalid walkthrough guide: ${filePath}`);
  }

  return rawGuide as DemoWalkthroughGuide;
}
