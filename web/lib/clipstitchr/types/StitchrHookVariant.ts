import type { StitchrHookFeedbackStatus } from "@/lib/clipstitchr/types/StitchrHookFeedbackStatus";

export type StitchrHookVariant = {
  acceptedAt?: string;
  angle: string;
  feedbackStatus?: StitchrHookFeedbackStatus;
  reason: string;
  rejectedAt?: string;
  rejectionReason?: string;
  text: string;
};
