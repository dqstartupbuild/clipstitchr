import { v } from "convex/values";
import { toolLeadSourceValidator } from "./toolLeadSource";

export const waitlistSourceValidator = v.union(
  v.literal("sign-up-page"),
  toolLeadSourceValidator,
);
