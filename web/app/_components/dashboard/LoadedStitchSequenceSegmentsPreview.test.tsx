import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LoadedStitchSequenceSegmentsPreview } from "@/app/_components/dashboard/LoadedStitchSequenceSegmentsPreview";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  props: null as {
    clips: VideoClip[];
    quickEdits?: Array<{ crop?: unknown } | undefined>;
    totalDuration: number;
  } | null,
}));

vi.mock("@/app/_components/stitchr/StitchrSequenceVideoPlayer", () => ({
  StitchrSequenceVideoPlayer: (props: NonNullable<typeof mocks.props>) => {
    mocks.props = props;
    return <div>Sequence preview</div>;
  },
}));

function createStitch(): Stitch {
  return {
    createdAt: "2026-08-22T00:00:00.000Z",
    demoClipId: "ugc_1",
    demoClipName: "UGC",
    duration: 5,
    height: 1920,
    id: "stitch_1",
    name: "Standalone",
    sequenceSegments: [
      {
        clipId: "ugc_1",
        clipName: "UGC",
        clipType: "ugc",
        duration: 5,
        order: 0,
        quickEdit: {
          crop: { mode: "smart-9x16", positionX: 0.25, scale: 1.5 },
          removeRanges: [],
        },
        trimRange: { start: 1, end: 6 },
      },
    ],
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    width: 1080,
  };
}

describe("LoadedStitchSequenceSegmentsPreview", () => {
  it("loads and renders a standalone Normal source once at its single-source duration", () => {
    const clip = {
      blob: new Blob(["video"], { type: "video/mp4" }),
      clipType: "ugc",
      duration: 8,
      height: 1920,
      id: "ugc_1",
      name: "UGC",
      width: 1080,
    } as VideoClip;

    renderToStaticMarkup(
      <LoadedStitchSequenceSegmentsPreview clips={[clip]} stitch={createStitch()} />,
    );

    expect(mocks.props?.clips).toEqual([clip]);
    expect(mocks.props?.totalDuration).toBe(5);
    expect(mocks.props?.quickEdits).toEqual([
      {
        crop: { mode: "smart-9x16", positionX: 0.25, scale: 1.5 },
        removeRanges: [],
      },
    ]);
  });
});
