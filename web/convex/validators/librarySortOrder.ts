import { v } from "convex/values";

export const librarySortOrderValidator = v.union(
  v.literal("newest"),
  v.literal("oldest"),
);
