import { describe, expect, it, vi } from "vitest";
import type { AudioSample } from "mediabunny";
import { createRetimedAudioSample } from "@/lib/clipstitchr/media/createRetimedAudioSample";

describe("createRetimedAudioSample", () => {
  it("moves sample timestamps onto the output timeline", () => {
    const sample = {
      setTimestamp: vi.fn(),
      timestamp: 4,
    } as unknown as AudioSample;

    expect(createRetimedAudioSample(sample, 10, 2)).toBe(sample);
    expect(sample.setTimestamp).toHaveBeenCalledWith(12);
  });

  it("clamps source-relative timestamps before adding the timeline offset", () => {
    const sample = {
      setTimestamp: vi.fn(),
      timestamp: 1,
    } as unknown as AudioSample;

    createRetimedAudioSample(sample, 10, 2);

    expect(sample.setTimestamp).toHaveBeenCalledWith(10);
  });
});
