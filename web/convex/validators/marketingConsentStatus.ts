import { v } from "convex/values";

export const marketingConsentStatusValidator = v.union(
  v.literal("consentUnknown"),
  v.literal("pendingVerification"),
  v.literal("confirmed"),
  v.literal("withdrawn"),
);
