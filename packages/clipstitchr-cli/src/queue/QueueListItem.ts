export type QueueListItem = {
  accountIds: number[];
  captionPreview: string;
  contentType: "stitch" | "swipe";
  postId: string;
  productId?: string;
  productName?: string;
  queuePosition?: number;
  scheduledAt?: string;
  sourceId: string;
  status: string;
  title: string;
};
