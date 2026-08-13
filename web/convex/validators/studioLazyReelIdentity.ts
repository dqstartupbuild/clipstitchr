import { v } from "convex/values";
import { studioLazyReelToolKeyValidator } from "./studioLazyReelToolKey";
import { studioLazyReelWorkflowKeyValidator } from "./studioLazyReelWorkflowKey";

export const studioLazyReelIdentityValidator = v.union(
  v.object({
    kind: v.literal("tool"),
    key: studioLazyReelToolKeyValidator,
  }),
  v.object({
    kind: v.literal("workflow"),
    key: studioLazyReelWorkflowKeyValidator,
  }),
);
