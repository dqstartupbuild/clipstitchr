export const demoWalkthroughGuideSources = [
  "agent-authored",
  "ai-assisted",
  "cli-template",
] as const;

export type DemoWalkthroughGuideSource =
  (typeof demoWalkthroughGuideSources)[number];
