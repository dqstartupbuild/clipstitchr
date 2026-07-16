"use client";

import { useSyncExternalStore } from "react";
import { getBillingReturnSearch } from "@/lib/clipstitchr/client/getBillingReturnSearch";
import { subscribeBillingReturnSearch } from "@/lib/clipstitchr/client/subscribeBillingReturnSearch";

const notices: Record<string, string> = {
  canceled: "Nothing changed. You can come back whenever you are ready.",
  "refill-success":
    "Payment received. Your refill credits will appear as soon as Stripe confirms them.",
  success:
    "Payment received. Your plan will appear as soon as Stripe confirms it.",
};

export function BillingReturnNotice() {
  const result = useSyncExternalStore(
    subscribeBillingReturnSearch,
    getBillingReturnSearch,
    getBillingReturnSearch,
  );
  const notice = result ? (notices[result] ?? null) : null;

  return notice ? (
    <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm font-semibold text-text-primary">
      {notice}
    </p>
  ) : null;
}
