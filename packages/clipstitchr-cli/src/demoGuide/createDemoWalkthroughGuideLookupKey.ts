import { normalizeDemoWalkthroughGuideName } from "./normalizeDemoWalkthroughGuideName.js";

export function createDemoWalkthroughGuideLookupKey(value: string) {
  return normalizeDemoWalkthroughGuideName(value).toLowerCase();
}
