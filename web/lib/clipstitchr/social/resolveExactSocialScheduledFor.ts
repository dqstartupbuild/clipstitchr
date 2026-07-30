import { assertSocialScheduledForWithinHorizon } from "./assertSocialScheduledForWithinHorizon";

export function resolveExactSocialScheduledFor(
  scheduledFor: string | undefined,
  now: string,
) {
  if (
    !scheduledFor ||
    !Number.isFinite(Date.parse(scheduledFor)) ||
    Date.parse(scheduledFor) <= Date.parse(now)
  ) {
    throw new Error("Choose a future time for this post.");
  }

  assertSocialScheduledForWithinHorizon(scheduledFor, now);

  return scheduledFor;
}
