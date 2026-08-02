export type PublishingReceiptResult =
  | "published"
  | "accepted-processing"
  | "user-action-required"
  | "rejected"
  | "canceled"
  | "uncertain";
