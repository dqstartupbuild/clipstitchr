import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";

export type SavedStitchrMode = Exclude<StitchrMode, "batch">;
