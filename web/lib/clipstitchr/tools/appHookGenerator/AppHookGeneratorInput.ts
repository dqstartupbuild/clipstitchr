import type { AppHookGeneratorEdgeLevel } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorEdgeLevel";

export type AppHookGeneratorInput = {
  appName: string;
  audience: string;
  desiredOutcome: string;
  edgeLevel: AppHookGeneratorEdgeLevel;
  problem: string;
  variationIndex?: number;
};
