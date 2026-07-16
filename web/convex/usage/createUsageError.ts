import { ConvexError } from "convex/values";
import type { UsageErrorCode } from "../../lib/clipstitchr/usage/types/UsageErrorCode";

export function createUsageError({
  available,
  code,
  message,
  required,
  resetsAt,
}: {
  available?: number;
  code: UsageErrorCode;
  message: string;
  required?: number;
  resetsAt?: string;
}) {
  return new ConvexError({
    available,
    code,
    message,
    required,
    resetsAt,
  });
}
