import { v } from "convex/values";

export const automationStitchrTemplateAllocationValidator = v.object({
  templateId: v.string(),
  count: v.number(),
});
