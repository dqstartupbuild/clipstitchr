import { v } from "convex/values";
import { stitchrHookFeedbackStatusValidator } from "./stitchrHookFeedbackStatus";

export const stitchrHookVariantValidator = v.object({
  acceptedAt: v.optional(v.string()),
  angle: v.string(),
  feedbackStatus: v.optional(stitchrHookFeedbackStatusValidator),
  reason: v.string(),
  rejectedAt: v.optional(v.string()),
  rejectionReason: v.optional(v.string()),
  text: v.string(),
});
