import type { LazyReelExample } from "@/lib/clipstitchr/types/lazyreel/LazyReelExample";
import type { LazyReelLift } from "@/lib/clipstitchr/types/lazyreel/LazyReelLift";

export type LazyReelCorpusSnapshot = {
  analyzedVideos: Array<{
    engagementTier: string;
    format: string;
    framework: string;
    hook: string;
    hookPattern: string;
    id: string;
    niche: string;
    onScreenText: string;
    productType: string;
    signatureDevice: string;
    structure: string[];
    tags: string[];
    whyItWorked: string;
  }>;
  appInsights: {
    analyzed?: number;
    appAdPatterns?: {
      format?: { breakoutLift?: Array<{ lift: number; value: string; breakout_count?: number }> };
      hookType?: { breakoutLift?: Array<{ lift: number; value: string; breakout_count?: number }> };
      hookXformatBreakoutLift?: Array<{
        breakout_count?: number;
        format: string;
        hookType: string;
        lift: number;
      }>;
      productEntry?: { breakoutLift?: Array<{ lift: number; value: string; breakout_count?: number }> };
    };
    appsTracked?: {
      apps?: Array<{ appCategory: string; appName: string; count: number }>;
      count?: number;
      list?: Array<{ appCategory: string; appName: string; count: number }>;
    };
    categoryCounts?: Record<string, number>;
    note?: string;
  };
  breakoutModel: {
    appAdBreakoutFormats?: {
      breakoutRules?: string[];
      hookArchetypes?: Array<{
        copyDecision: string;
        durationRequirement: string;
        id: string;
        template: string;
      }>;
    };
    conceptControlledPairs?: Array<{
      concept: string;
      firstFrameDelta: string;
      gap: string;
      lesson: string;
    }>;
    confound?: { note?: string; takeaway?: string };
    corpusContrast?: Record<
      string,
      Array<{ lift: number | null; pctHigh: number; pctLow: number; value: string }>
    >;
    generatedAt?: string;
    laws?: Array<{ corpusEcho?: string; evidence: string; law: string }>;
    method?: string;
    validation?: {
      baseline?: string;
      interpretation?: string;
      method?: string;
      pooled?: string;
      tests?: Array<{ accuracy: string; name: string; reads?: string }>;
    };
  };
  combinations: {
    analyzable?: number;
    byNiche?: Record<
      string,
      Array<{ combo: string; dims: string; lift: number; nTotal: number; nWinners: number }>
    >;
    method?: string;
    overall?: Array<{
      combo: string;
      dims: string;
      lift: number;
      nTotal: number;
      nWinners: number;
    }>;
  };
  examples: LazyReelExample[];
  insights: {
    byNiche?: Record<
      string,
      {
        breakoutThresholdVpf?: number;
        frameworks?: LazyReelLift[];
        gaps?: Array<{ label: string; lift: number; sharePct: number }>;
        hookPatternsThatOverIndex?: LazyReelLift[];
        sampleSize: number;
        saturated?: Array<{ label: string; lift: number; sharePct: number }>;
      }
    >;
    decoded?: number;
    method?: string;
    overallHookLift?: LazyReelLift[];
    source?: string;
  };
  stats: {
    curatedTeardowns?: number;
    decodedByPipeline?: number;
    generatedAt?: string;
    note?: string;
    trendingTags?: number;
  };
  teardowns: Array<{
    framework: string;
    hookPattern: string;
    hookTechnique: string;
    niche: string;
    reach: string;
    retentionDevice: string;
    stealThis: string;
    viewBucket: string;
    viralMechanism: string;
  }>;
  trendingTags: Array<{ posts: number; rank: number; tag: string; year: number }>;
  trends: Array<{
    formula: string | null;
    framework: string;
    hookPattern: string;
    medianVpf: number;
    name: string;
    recurrence: string;
    transfer: string[];
    videoFormat: string;
    whyItTravels: string | null;
  }>;
  visualInsights: {
    analyzed?: number;
    byNiche?: Record<
      string,
      { formatDistribution?: Record<string, number>; formatsThatOverIndex?: LazyReelLift[]; sampleSize: number }
    >;
    craft?: Record<string, { lift?: LazyReelLift[] }>;
    formatsThatOverIndex?: LazyReelLift[];
    note?: string;
  };
  wordInsights: {
    byNiche?: Record<
      string,
      {
        phrasesThatOverIndex?: Array<{ lift: number; nTotal: number; term: string }>;
        sampleSize?: number;
        wordsThatOverIndex?: Array<{ lift: number; nTotal: number; term: string }>;
      }
    >;
  };
};
