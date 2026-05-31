import { v } from "convex/values";
import { automationToolValidator } from "./automationTool";

export const automationProvenanceValidator = v.object({
  source: v.literal("automation"),
  runId: v.string(),
  taskId: v.string(),
  tool: automationToolValidator,
  automationDate: v.string(),
  sourceSummary: v.optional(v.string()),
});
