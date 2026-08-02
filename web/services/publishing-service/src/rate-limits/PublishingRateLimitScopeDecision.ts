export type PublishingRateLimitScopeDecision = Readonly<{
  remaining: number;
  resetAtEpochMilliseconds: number;
}>;
