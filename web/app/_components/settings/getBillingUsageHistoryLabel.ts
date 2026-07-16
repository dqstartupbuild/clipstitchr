import type { BillingUsageHistoryEntry } from "@/app/_components/settings/types/BillingUsageHistoryEntry";

const operationLabels: Record<string, string> = {
  avatar_photo: "Avatar photo",
  background_photo: "Background photo",
  clipr_video: "Clipr video",
  credit_refill: "Credit refill",
  monthly_allowance: "Monthly allowance",
  photo_expansion: "Photo expansion",
  stitch: "Stitch",
  swapr_video: "Swapr video",
  swipr: "Swipe",
};

const entryTypeSuffixes: Record<string, string> = {
  commit: "finished",
  grant: "added",
  release: "returned",
  reserve: "held",
  reverse: "restored",
  revoke: "removed",
};

export function getBillingUsageHistoryLabel(entry: BillingUsageHistoryEntry) {
  const operationLabel =
    operationLabels[entry.operation] ?? entry.operation.replaceAll("_", " ");
  const suffix = entryTypeSuffixes[entry.entryType];

  return suffix ? `${operationLabel} ${suffix}` : operationLabel;
}
