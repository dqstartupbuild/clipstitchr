import type { LazyReelExample } from "./LazyReelExample";

export type LazyReelStudyVideosData = {
  corpusMatches: Array<{
    engagementTier: string;
    format: string;
    framework: string;
    hook: string;
    hookPattern: string;
    id: string;
    niche: string;
    signatureDevice: string;
    whyItWorked: string;
  }>;
  examples: LazyReelExample[];
  filters: {
    hookPattern: string | null;
    niche: string | null;
    query: string | null;
    videoFormat: string | null;
  };
  teardowns: Array<{
    hookPattern: string;
    hookTechnique: string;
    reach: string;
    retentionDevice: string;
    stealThis: string;
    viralMechanism: string;
  }>;
};
