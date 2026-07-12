import { v } from "convex/values";
import { hookLabIdeaStatusValidator } from "./hookLabIdeaStatus";

export const hookLabIdeaStatusFilterValidator = v.union(
  v.literal("all"),
  hookLabIdeaStatusValidator,
);
