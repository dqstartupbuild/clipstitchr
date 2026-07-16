import type { UsageOperation } from "./UsageOperation";

export type UsageLedgerOperation =
  | UsageOperation
  | "monthly_allowance"
  | "credit_refill"
  | "support_adjustment";
