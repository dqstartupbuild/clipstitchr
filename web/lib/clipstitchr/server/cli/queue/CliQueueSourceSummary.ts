export type CliQueueSourceSummary = {
  postId: string;
  productId: string;
  productName?: string;
  sourceId: string;
  sourceName?: string;
  sourceType: "stitch" | "swipe";
};
