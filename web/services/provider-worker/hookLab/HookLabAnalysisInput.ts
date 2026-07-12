import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { HookLabIdeaDocument } from "./HookLabIdeaDocument";

export type HookLabAnalysisInput = {
  idea: HookLabIdeaDocument;
  sourceDemoClip?: Record<string, unknown> | null;
  sourceStitch?: Record<string, unknown> | null;
  sourceUgcClip?: (Record<string, unknown> & {
    originalName?: string;
    posterObject?: R2ObjectReference;
    size?: number;
    videoObject?: R2ObjectReference;
  }) | null;
};
