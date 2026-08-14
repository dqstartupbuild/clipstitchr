export type SocialPublishingDailyMetric = {
  date: string;
  postCount: number;
  metrics: {
    clicks: number;
    comments: number;
    impressions: number;
    likes: number;
    reach: number;
    saves: number;
    shares: number;
    views: number;
  };
};
