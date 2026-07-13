import type { DeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysisOptions";

export const defaultDeadSpaceAnalysisOptions: DeadSpaceAnalysisOptions = {
  audioThreshold: 0.025,
  minimumSpanSeconds: 1.5,
  sampleIntervalSeconds: 0.5,
  visualThreshold: 0.035,
};
