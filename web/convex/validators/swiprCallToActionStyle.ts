import { v } from "convex/values";

export const swiprCallToActionStyleValidator = v.union(
  v.literal("any"),
  v.literal("save"),
  v.literal("follow"),
  v.literal("engagement"),
  v.literal("product"),
);
