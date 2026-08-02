export type PublishingApiAnalyticsRefreshTarget = Readonly<{
  accessToken: string;
  integrationId: string;
  postId: string;
  postStateId: string;
  provider: "instagram" | "instagram-standalone" | "tiktok";
  receiptId: string;
  remotePublicationId: string;
}>;
