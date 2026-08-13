export type TikTokWebhookEnvelope = Readonly<{
  clientKey: string;
  content: string;
  createTimeEpochSeconds: number;
  event: string;
  userOpenId: string;
}>;
