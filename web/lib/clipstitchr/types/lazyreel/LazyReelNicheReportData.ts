import type { LazyReelExample } from "./LazyReelExample";
import type { LazyReelLift } from "./LazyReelLift";
import type { LazyReelNicheReportFocus } from "./LazyReelNicheReportFocus";

export type LazyReelNicheReportData = {
  apps: Array<{ appCategory: string; appName: string; count: number }>;
  categoryCounts: Array<{ category: string; count: number }>;
  combinations: Array<{
    dimensions: string;
    label: string;
    lift: number;
    sampleSize: number;
    winners: number;
  }>;
  craftSignals: Array<{ label: string; lift: number; sampleSize: number }>;
  corpusMatches: Array<{
    format: string;
    framework: string;
    hook: string;
    hookPattern: string;
    id: string;
    niche: string;
    signatureDevice: string;
    whyItWorked: string;
  }>;
  culturalTags: Array<{ rank: number; tag: string; year: number }>;
  crowdedPatterns: Array<{ label: string; lift: number; sharePercent: number }>;
  examples: LazyReelExample[];
  focus: LazyReelNicheReportFocus;
  formatLift: LazyReelLift[];
  frameworkLift: LazyReelLift[];
  hookLift: LazyReelLift[];
  niche: string | null;
  openingWords: Array<{ lift: number; sampleSize: number; term: string }>;
  opportunityPatterns: Array<{
    label: string;
    lift: number;
    sharePercent: number;
  }>;
  sampleSize: number | null;
  scope: string;
  teardowns: Array<{
    hookPattern: string;
    hookTechnique: string;
    reach: string;
    retentionDevice: string;
    stealThis: string;
    viralMechanism: string;
  }>;
  topAppPatterns: Array<{ label: string; lift: number; sampleSize: number }>;
  trends: Array<{
    formula: string | null;
    framework: string;
    hookPattern: string;
    medianViewsPerFollower: number;
    name: string;
    recurrence: string;
    transfer: string[];
    videoFormat: string;
    whyItTravels: string | null;
  }>;
};
