export type PublishingApiAnalyticsRefreshTarget = Readonly<{
  accessToken: string;
  integrationId: string;
  postId: string;
  productId: string;
  postStateId: string;
  provider: "instagram" | "instagram-standalone" | "tiktok" | "youtube";
  receiptId: string;
  remotePublicationId: string;
}>;
