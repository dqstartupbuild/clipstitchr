import { v } from "convex/values";

export const courseKeyValidator = v.union(
  v.literal("five-day-app-content-sprint"),
  v.literal("ugc-to-app-ad-mini-course"),
  v.literal("app-creative-testing-system-workshop"),
);
