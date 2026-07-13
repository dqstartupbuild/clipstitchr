import { describe, expect, it } from "vitest";
import { calculateCreativeTestingMetrics } from "@/lib/clipstitchr/tools/creativeTestingTracker/calculateCreativeTestingMetrics";
import { createCreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/createCreativeTestingExperiment";
import { createCreativeTestingTrackerCsv } from "@/lib/clipstitchr/tools/creativeTestingTracker/createCreativeTestingTrackerCsv";
import { createCreativeTestingTrackerMarkdown } from "@/lib/clipstitchr/tools/creativeTestingTracker/createCreativeTestingTrackerMarkdown";

describe("calculateCreativeTestingMetrics", () => {
  it("calculates CTR, install rate, CPI, and CPA from one entered row", () => {
    const metrics = calculateCreativeTestingMetrics({
      ...createCreativeTestingExperiment(1),
      clicks: 500,
      conversions: 20,
      impressions: 10_000,
      installs: 100,
      spend: 400,
    });

    expect(metrics.ctr.value).toBe(5);
    expect(metrics.installRate.value).toBe(20);
    expect(metrics.cpi.value).toBe(4);
    expect(metrics.cpa.value).toBe(20);
  });

  it("names every missing denominator instead of returning Infinity or NaN", () => {
    const metrics = calculateCreativeTestingMetrics(
      createCreativeTestingExperiment(1),
    );

    expect(metrics.ctr).toEqual({
      unavailableReason: "Add impressions to calculate CTR",
      value: null,
    });
    expect(metrics.installRate.value).toBeNull();
    expect(metrics.cpi.value).toBeNull();
    expect(metrics.cpa.value).toBeNull();
  });

  it("creates CSV and Markdown exports with escaped text and calculated values", () => {
    const experiment = {
      ...createCreativeTestingExperiment(1),
      clicks: 50,
      cta: "Try it, today",
      hook: 'A "faster" way',
      impressions: 1_000,
    };

    const csv = createCreativeTestingTrackerCsv([experiment]);
    const markdown = createCreativeTestingTrackerMarkdown([experiment]);

    expect(csv).toContain('"A ""faster"" way"');
    expect(csv).toContain('"Try it, today"');
    expect(csv).toContain("5.00%");
    expect(markdown).toContain("CTR: 5.00%");
    expect(markdown).toContain("Add installs to calculate CPI");
  });
});
