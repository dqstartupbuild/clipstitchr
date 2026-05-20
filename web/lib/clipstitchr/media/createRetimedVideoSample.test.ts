import { describe, expect, it, vi } from "vitest";
import type { VideoSample } from "mediabunny";
import { createRetimedVideoSample } from "@/lib/clipstitchr/media/createRetimedVideoSample";

describe("createRetimedVideoSample", () => {
  it("moves sample timestamps and clears source rotation", () => {
    const sample = {
      setRotation: vi.fn(),
      setTimestamp: vi.fn(),
      timestamp: 4,
    } as unknown as VideoSample;

    expect(createRetimedVideoSample(sample, 10, 2)).toBe(sample);
    expect(sample.setTimestamp).toHaveBeenCalledWith(12);
    expect(sample.setRotation).toHaveBeenCalledWith(0);
  });

  it("clamps source-relative timestamps before adding the timeline offset", () => {
    const sample = {
      setRotation: vi.fn(),
      setTimestamp: vi.fn(),
      timestamp: 1,
    } as unknown as VideoSample;

    createRetimedVideoSample(sample, 10, 2);

    expect(sample.setTimestamp).toHaveBeenCalledWith(10);
    expect(sample.setRotation).toHaveBeenCalledWith(0);
  });
});
