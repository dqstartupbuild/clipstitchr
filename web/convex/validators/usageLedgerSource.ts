import { v } from "convex/values";

export const usageLedgerSourceValidator = v.union(
  v.literal("stripe_webhook"),
  v.literal("user_action"),
  v.literal("worker"),
  v.literal("reconciler"),
  v.literal("support"),
);
