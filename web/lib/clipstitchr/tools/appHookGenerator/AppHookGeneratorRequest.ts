import type { AppHookGeneratorEdgeLevel } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorEdgeLevel";

export type AppHookGeneratorRequest = {
  appName: string;
  audience: string;
  desiredOutcome: string;
  edgeLevel: AppHookGeneratorEdgeLevel;
  problem: string;
  variationIndex: number;
};
