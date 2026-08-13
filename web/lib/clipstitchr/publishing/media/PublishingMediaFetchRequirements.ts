export type PublishingMediaFetchRequirements = {
  minimumRemainingSeconds: number;
  requestedValiditySeconds: number;
  requiresNoRedirect: boolean;
  requiresHead: boolean;
  requiresRange: boolean;
  requiresVerifiedClipStitchrDomain: boolean;
};
