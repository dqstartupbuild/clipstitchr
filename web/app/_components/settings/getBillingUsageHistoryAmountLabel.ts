import type { BillingUsageHistoryEntry } from "@/app/_components/settings/types/BillingUsageHistoryEntry";

export function getBillingUsageHistoryAmountLabel(
  entry: BillingUsageHistoryEntry,
) {
  const quantity = Math.abs(entry.quantity).toLocaleString();

  if (entry.entryType === "reserve") {
    return `${quantity} held`;
  }

  if (entry.entryType === "commit") {
    return `${quantity} used`;
  }

  if (entry.entryType === "release") {
    return `${quantity} returned`;
  }

  if (entry.entryType === "revoke") {
    return `${quantity} removed`;
  }

  if (entry.entryType === "reverse") {
    return `${quantity} restored`;
  }

  const amount =
    entry.availableDelta ||
    -entry.consumedDelta ||
    entry.reservedDelta ||
    entry.quantity;

  return `${amount > 0 ? "+" : ""}${amount.toLocaleString()}`;
}
