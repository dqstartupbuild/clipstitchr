export type LazyReelBreakoutLawsData = {
  appAdArchetypes: Array<{
    copyDecision: string;
    durationRequirement: string;
    id: string;
    template: string;
  }>;
  caveats: string[];
  conceptPairs: Array<{
    concept: string;
    firstFrameDelta: string;
    gap: string;
    lesson: string;
  }>;
  contrasts: Array<{
    breakoutPercent: number;
    label: string;
    lift: number;
    lowPercent: number;
  }>;
  laws: Array<{ corpusEcho: string | null; evidence: string; law: string }>;
  validation: null | {
    baseline: string;
    interpretation: string;
    method: string;
    pooled: string;
    tests: Array<{ accuracy: string; name: string; reads: string | null }>;
  };
};
