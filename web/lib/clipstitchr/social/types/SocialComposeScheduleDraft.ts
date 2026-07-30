export type SocialComposeScheduleDraft = {
  mode: "now" | "product_queue" | "exact_time";
  scheduledFor: string;
};
