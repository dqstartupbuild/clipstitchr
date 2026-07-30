export function getSocialDeliveryStatusLabel(status: string) {
  const labels: Record<string, string> = {
    scheduled: "Scheduled",
    queued: "Queued",
    publishing: "Sending",
    status_check: "Checking status",
    waiting_for_user: "Waiting for you in TikTok",
    published: "Posted",
    partially_published: "Partially posted",
    failed: "Did not post",
    needs_attention: "Needs your review",
    held: "On hold",
    canceled: "Canceled",
    outcome_unknown: "Check before taking action",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}
