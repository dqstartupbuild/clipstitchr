import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";

export type LongrVideoMetadata = Omit<LongrVideo, "blob">;
