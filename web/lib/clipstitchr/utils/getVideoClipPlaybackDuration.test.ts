import { describe, expect, it } from "vitest";
import { getVideoClipPlaybackDuration } from "@/lib/clipstitchr/utils/getVideoClipPlaybackDuration";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

function createClip(overrides: Partial<VideoClipMetadata> = {}): VideoClipMetadata {
  return {
    clipType: "ugc",
    duration: 12,
    height: 1920,
    id: "clip_1",
    name: "Launch clip",
    originalName: "launch.mp4",
    updatedAt: "2026-06-27T00:00:00.000Z",
    width: 1080,
    ...overrides,
  } as VideoClipMetadata;
}

describe("getVideoClipPlaybackDuration", () => {
  it("uses the saved default trim and removes saved quick-edit cuts", () => {
    const clip = createClip({
      defaultTrimRange: { start: 1, end: 11 },
      quickEdit: {
        appliedAt: "2026-06-27T00:00:00.000Z",
        removeRanges: [
          { start: 3, end: 5, reason: "Slow setup" },
          { start: 8, end: 9 },
        ],
        source: "manual-cut",
      },
    });

    expect(getVideoClipPlaybackDuration(clip)).toBe(7);
  });

  it("uses a session trim override without mutating the source default", () => {
    const clip = createClip({
      defaultTrimRange: { start: 0, end: 12 },
      quickEdit: {
        appliedAt: "2026-06-27T00:00:00.000Z",
        removeRanges: [{ start: 4, end: 6 }],
        source: "manual-cut",
      },
    });

    expect(
      getVideoClipPlaybackDuration(clip, { start: 2, end: 10 }, 2),
    ).toBe(3);
  });
});
