import type { CliprCompositionStrategy } from "@/lib/clipstitchr/types/CliprCompositionStrategy";

export type CliprGenerationStrategy = {
  sceneCount: number;
  sceneDurationSeconds: number;
  strategy: CliprCompositionStrategy;
};
