import type { CliDemoGuideGeneratedStep } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGeneratedStep";

export type CliDemoGuideGenerationOutput = {
  goal: string;
  steps: CliDemoGuideGeneratedStep[];
  title: string;
};
