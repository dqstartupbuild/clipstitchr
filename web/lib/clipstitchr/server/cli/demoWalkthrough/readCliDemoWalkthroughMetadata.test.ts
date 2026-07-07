import { describe, expect, it } from "vitest";
import { readCliDemoWalkthroughMetadata } from "./readCliDemoWalkthroughMetadata";

describe("readCliDemoWalkthroughMetadata", () => {
  it("keeps valid guide metadata and matching timings", () => {
    const metadata = readCliDemoWalkthroughMetadata({
      guide: {
        goal: "Show the upload flow",
        id: "guide_123",
        steps: [{ id: "step-1", label: "Open the dashboard" }],
        title: "Upload walkthrough",
      },
      timings: [
        {
          completedAtMs: 1200.4,
          durationMs: 1200.4,
          label: "Open the dashboard",
          startedAtMs: 0,
          stepId: "step-1",
          stepIndex: 0,
        },
      ],
    });

    expect(metadata).toEqual({
      guide: {
        goal: "Show the upload flow",
        id: "guide_123",
        steps: [{ id: "step-1", label: "Open the dashboard" }],
        title: "Upload walkthrough",
        version: undefined,
      },
      timings: [
        {
          completedAtMs: 1200,
          durationMs: 1200,
          label: "Open the dashboard",
          startedAtMs: 0,
          stepId: "step-1",
          stepIndex: 0,
        },
      ],
    });
  });

  it("drops non-finite timings and timings that do not match guide steps", () => {
    const metadata = readCliDemoWalkthroughMetadata({
      guide: {
        goal: "Show the upload flow",
        id: "guide_123",
        steps: [{ id: "step-1", label: "Open the dashboard" }],
        title: "Upload walkthrough",
      },
      timings: [
        {
          completedAtMs: Number.NaN,
          durationMs: 100,
          label: "Open the dashboard",
          startedAtMs: 0,
          stepId: "step-1",
          stepIndex: 0,
        },
        {
          completedAtMs: 100,
          durationMs: 100,
          label: "Unknown",
          startedAtMs: 0,
          stepId: "missing-step",
          stepIndex: 1,
        },
      ],
    });

    expect(metadata?.timings).toBeUndefined();
  });

  it("returns undefined for unusable guide metadata", () => {
    expect(
      readCliDemoWalkthroughMetadata({
        guide: {
          goal: "Show something",
          id: "guide_123",
          steps: [],
          title: "Broken walkthrough",
        },
      }),
    ).toBeUndefined();
  });
});
