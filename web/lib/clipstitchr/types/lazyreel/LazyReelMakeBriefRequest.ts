import type { LazyReelMakeBriefMode } from "./LazyReelMakeBriefMode";

export type LazyReelMakeBriefRequest = {
  audience?: string;
  count?: number;
  framework?: string;
  mode?: LazyReelMakeBriefMode;
  niche?: string;
  objective?: string;
  product: string;
  tool: "make_brief";
};
