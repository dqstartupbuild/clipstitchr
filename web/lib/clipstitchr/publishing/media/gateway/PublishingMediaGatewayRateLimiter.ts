export type PublishingMediaGatewayRateLimitRequest = {
  grantKey: string;
  quotaIdentity: string;
  readBytes: number;
};

export type PublishingMediaGatewayRateLimiter = {
  consume: (
    request: PublishingMediaGatewayRateLimitRequest,
  ) => Promise<void>;
};
