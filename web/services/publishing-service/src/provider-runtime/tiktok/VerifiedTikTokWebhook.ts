export type VerifiedTikTokWebhook = Readonly<{
  timestampEpochSeconds: number;
  dedupeKey: string;
  body: unknown;
}>;
