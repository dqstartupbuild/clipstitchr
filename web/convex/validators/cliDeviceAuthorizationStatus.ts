import { v } from "convex/values";

export const cliDeviceAuthorizationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("consumed"),
  v.literal("expired"),
  v.literal("denied"),
);
