import { v } from "convex/values";
import { usageOperationValidator } from "./usageOperation";

export const usageLedgerOperationValidator = v.union(
  usageOperationValidator,
  v.literal("monthly_allowance"),
  v.literal("credit_refill"),
  v.literal("support_adjustment"),
);
