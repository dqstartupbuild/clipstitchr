import { v } from "convex/values";

export const emailProviderOperationKindValidator = v.union(
  v.literal("contactSync"),
  v.literal("contactResubscribe"),
  v.literal("contactUnsubscribe"),
  v.literal("workflowEvent"),
  v.literal("transactional"),
);
