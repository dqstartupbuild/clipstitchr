export type SocialAnalyticsSnapshot = {
  source: "instagram_official" | "tiktok_official" | "apify_public";
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  watchTimeSeconds: number | null;
  availabilityJson: string;
};
