import { describe, expect, it } from "vitest";
import { getStitchrHookTextIsUsable } from "@/lib/clipstitchr/server/getStitchrHookTextIsUsable";

describe("getStitchrHookTextIsUsable", () => {
  it.each([
    "wait... it starts me at my actual level?",
    "so random push-ups were not, in fact, a workout plan",
    "I fear my no-gym excuse is officially gone",
    "not me restarting this phase every Monday",
    "you're telling me I needed a plan, not a gym?",
  ])("accepts creator-discovery overlays: %s", (text) => {
    expect(getStitchrHookTextIsUsable(text)).toBe(true);
  });

  it.each([
    "If bodyweight exercises feel aimless, this is why",
    "A daily workout that fits your level",
    "No gym. No guessing. Just today's workout.",
    "Home workouts finally come with a plan",
    "This changes everything",
    "This app makes workouts easier",
  ])("rejects explanation-dependent or brand-first overlays: %s", (text) => {
    expect(getStitchrHookTextIsUsable(text)).toBe(false);
  });
});
