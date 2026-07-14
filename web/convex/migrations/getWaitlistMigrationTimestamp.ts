import type { Doc } from "../_generated/dataModel";

export function getWaitlistMigrationTimestamp(waitlistEntry: Doc<"waitlist">) {
  const parsed = Date.parse(waitlistEntry.createdAt);
  return Number.isFinite(parsed) ? parsed : waitlistEntry._creationTime;
}
