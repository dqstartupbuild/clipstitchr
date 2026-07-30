import { afterEach, describe, expect, it } from "vitest";
import { assertSocialScheduledForWithinHorizon } from "./assertSocialScheduledForWithinHorizon";
import { getMaxPendingSocialDeliveriesPerOwner } from "./getMaxPendingSocialDeliveriesPerOwner";
import { getMaxScheduledSocialPostsPerOwner } from "./getMaxScheduledSocialPostsPerOwner";
import { getSocialSchedulingHorizonDays } from "./getSocialSchedulingHorizonDays";

const originalHorizon = process.env.SOCIAL_SCHEDULING_HORIZON_DAYS;
const originalPostLimit =
  process.env.SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER;
const originalTargetLimit =
  process.env.SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER;

describe("social scheduling limits", () => {
  afterEach(() => {
    process.env.SOCIAL_SCHEDULING_HORIZON_DAYS = originalHorizon;
    process.env.SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER = originalPostLimit;
    process.env.SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER =
      originalTargetLimit;
  });

  it("uses the documented 90/500/2000 defaults", () => {
    delete process.env.SOCIAL_SCHEDULING_HORIZON_DAYS;
    delete process.env.SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER;
    delete process.env.SOCIAL_MAX_PENDING_DELIVERIES_PER_OWNER;

    expect(getSocialSchedulingHorizonDays()).toBe(90);
    expect(getMaxScheduledSocialPostsPerOwner()).toBe(500);
    expect(getMaxPendingSocialDeliveriesPerOwner()).toBe(2000);
  });

  it("accepts the horizon boundary and rejects later exact times", () => {
    delete process.env.SOCIAL_SCHEDULING_HORIZON_DAYS;
    const now = "2026-08-01T00:00:00.000Z";

    expect(() =>
      assertSocialScheduledForWithinHorizon(
        "2026-10-30T00:00:00.000Z",
        now,
      ),
    ).not.toThrow();
    expect(() =>
      assertSocialScheduledForWithinHorizon(
        "2026-10-30T00:00:00.001Z",
        now,
      ),
    ).toThrow("next 90 days");
  });
});
