import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type SwaprReferenceVideoSegment = {
  duration: number;
  isTemporary?: boolean;
  videoObject: R2ObjectReference;
};
