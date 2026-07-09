import { normalizeDemoWalkthroughGuideName } from "./normalizeDemoWalkthroughGuideName.js";

export function createDemoWalkthroughGuideName(input: {
  flowName?: string;
  goal?: string;
  title?: string;
}) {
  const rawName = input.flowName ?? input.goal ?? input.title ?? "Demo guide";
  const name = normalizeDemoWalkthroughGuideName(rawName);

  return name.slice(0, 80) || "Demo guide";
}
