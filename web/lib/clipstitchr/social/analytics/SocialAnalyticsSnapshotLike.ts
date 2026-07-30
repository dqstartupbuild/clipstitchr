export type SocialAnalyticsSnapshotLike = {
  capturedAt: string;
  source: string;
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  watchTimeSeconds: number | null;
};
