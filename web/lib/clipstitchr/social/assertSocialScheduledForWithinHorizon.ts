import { getSocialSchedulingHorizonDays } from "./getSocialSchedulingHorizonDays";

export function assertSocialScheduledForWithinHorizon(
  scheduledFor: string,
  now: string,
) {
  const scheduledMs = Date.parse(scheduledFor);
  const nowMs = Date.parse(now);
  const horizonMs =
    nowMs + getSocialSchedulingHorizonDays() * 24 * 60 * 60 * 1_000;

  if (!Number.isFinite(scheduledMs) || scheduledMs > horizonMs) {
    throw new Error(
      `Choose a time within the next ${getSocialSchedulingHorizonDays()} days.`,
    );
  }
}
