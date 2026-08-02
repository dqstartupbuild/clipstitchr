export type PublishingMediaFetchGrant = {
  expiresAtEpochMs: number;
  supportsNoRedirectFetch: boolean;
  supportsGet: boolean;
  supportsHead: boolean;
  supportsRange: boolean;
  url: string;
};
