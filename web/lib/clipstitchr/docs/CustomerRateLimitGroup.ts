import type { CustomerRateLimit } from "@/lib/clipstitchr/docs/CustomerRateLimit";

export type CustomerRateLimitGroup = {
  title: string;
  rows: CustomerRateLimit[];
};
