import type { AppHookGeneratorHook } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorHook";

export type AppHookGeneratorResult = {
  hooks: AppHookGeneratorHook[];
  variationIndex: number;
};
