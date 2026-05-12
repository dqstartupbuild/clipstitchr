import { v } from "convex/values";

export const avatarWardrobeStyleValidator = v.union(
  v.literal("any"),
  v.literal("male"),
  v.literal("female"),
);
