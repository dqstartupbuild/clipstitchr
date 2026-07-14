import { v } from "convex/values";

export const publicToolGateModeValidator = v.union(
  v.literal("open-result"),
  v.literal("useful-preview"),
  v.literal("gated-portability"),
  v.literal("email-native"),
);
