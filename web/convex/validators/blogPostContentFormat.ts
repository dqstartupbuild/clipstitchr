import { v } from "convex/values";

export const blogPostContentFormatValidator = v.union(
  v.literal("mdx"),
  v.literal("markdown"),
  v.literal("html"),
);
