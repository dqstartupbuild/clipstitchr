import { v } from "convex/values";
import { socialPublishModeValidator } from "./socialPublishMode";

export const socialPostTargetInputValidator = v.object({
  id: v.string(),
  socialAccountId: v.string(),
  publishMode: socialPublishModeValidator,
  controlsJson: v.string(),
});
