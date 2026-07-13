export type AppAdCreativeFatigueResult = {
  activeCreativeCount: number;
  audienceSize: number;
  ceilingReachedWithinWindow: boolean;
  dailyFrequency: number | null;
  dailyImpressions: number;
  daysToFrequencyCeiling: number | null;
  frequencyCeiling: number;
  impressionsPerCreativeAtCeiling: number | null;
  impressionsPerCreativeInWindow: number | null;
  modeledFrequencyInWindow: number | null;
  windowDays: number;
};
