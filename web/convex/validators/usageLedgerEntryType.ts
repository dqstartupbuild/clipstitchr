import { v } from "convex/values";

export const usageLedgerEntryTypeValidator = v.union(
  v.literal("grant"),
  v.literal("reserve"),
  v.literal("commit"),
  v.literal("release"),
  v.literal("expire"),
  v.literal("adjust"),
  v.literal("revoke"),
  v.literal("reverse"),
);
