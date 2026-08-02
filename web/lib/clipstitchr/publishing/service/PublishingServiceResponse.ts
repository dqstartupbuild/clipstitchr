export type PublishingServiceResponse = Readonly<{
  body: unknown;
  retryAfterSeconds: number | undefined;
  status: number;
}>;
