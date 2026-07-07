import {
  demoWalkthroughGuideSources,
  type DemoWalkthroughGuideSource,
} from "./DemoWalkthroughGuideSource.js";

export function readDemoWalkthroughGuideSource(
  value: unknown,
): DemoWalkthroughGuideSource {
  return demoWalkthroughGuideSources.includes(
    value as DemoWalkthroughGuideSource,
  )
    ? (value as DemoWalkthroughGuideSource)
    : "cli-template";
}
