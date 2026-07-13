import type { DeadSpaceSample } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceSample";
import type { DeadSpaceSpan } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceSpan";

export type DeadSpaceAnalysis = {
  duration: number;
  hasAudio: boolean;
  sampleCount: number;
  samples: readonly DeadSpaceSample[];
  spans: readonly DeadSpaceSpan[];
};
