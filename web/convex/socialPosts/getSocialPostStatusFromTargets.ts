import type { Doc } from "../_generated/dataModel";

export function getSocialPostStatusFromTargets(
  targets: Doc<"socialPostTargets">[],
) {
  if (targets.length === 0) {
    return "draft" as const;
  }

  const statuses = new Set(targets.map((target) => target.status));
  const publishedCount = targets.filter(
    (target) => target.status === "published",
  ).length;

  if (publishedCount === targets.length) {
    return "published" as const;
  }

  if (publishedCount > 0) {
    return "partially_published" as const;
  }

  if (statuses.has("outcome_unknown")) {
    return "outcome_unknown" as const;
  }

  if (statuses.has("waiting_for_user")) {
    return "waiting_for_user" as const;
  }

  if (statuses.has("publishing") || statuses.has("status_check")) {
    return "publishing" as const;
  }

  if (statuses.has("needs_attention")) {
    return "needs_attention" as const;
  }

  if (statuses.has("held")) {
    return "held" as const;
  }

  if (statuses.has("scheduled") || statuses.has("queued")) {
    return "scheduled" as const;
  }

  if (statuses.has("failed")) {
    return "failed" as const;
  }

  return "canceled" as const;
}
