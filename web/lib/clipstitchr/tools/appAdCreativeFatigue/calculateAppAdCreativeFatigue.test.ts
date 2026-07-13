import { describe, expect, it } from "vitest";
import { calculateAppAdCreativeFatigue } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/calculateAppAdCreativeFatigue";
import { defaultAppAdCreativeFatigueInput } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/defaultAppAdCreativeFatigueInput";

describe("calculateAppAdCreativeFatigue", () => {
  it("models even delivery without claiming performance fatigue", () => {
    const result = calculateAppAdCreativeFatigue(
      defaultAppAdCreativeFatigueInput,
    );

    expect(result.dailyFrequency).toBe(0.2);
    expect(result.modeledFrequencyInWindow).toBeCloseTo(2.8);
    expect(result.daysToFrequencyCeiling).toBe(15);
    expect(result.impressionsPerCreativeInWindow).toBe(56_000);
    expect(result.impressionsPerCreativeAtCeiling).toBe(60_000);
    expect(result.ceilingReachedWithinWindow).toBe(false);
  });

  it("returns unavailable values when delivery cannot be modeled", () => {
    const result = calculateAppAdCreativeFatigue({
      ...defaultAppAdCreativeFatigueInput,
      audienceSize: 0,
    });

    expect(result.dailyFrequency).toBeNull();
    expect(result.daysToFrequencyCeiling).toBeNull();
    expect(result.impressionsPerCreativeInWindow).toBeNull();
  });
});
