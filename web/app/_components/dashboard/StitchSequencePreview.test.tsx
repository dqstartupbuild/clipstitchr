import { describe, expect, it, vi } from "vitest";
import { StitchSequencePreview } from "@/app/_components/dashboard/StitchSequencePreview";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

function createStitch(): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 9,
    height: 1920,
    id: "stitch_1",
    includeDemoAudio: true,
    includeUgcAudio: true,
    name: "Launch Stitch",
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    width: 1080,
  };
}

describe("StitchSequencePreview", () => {
  it("caps the fallback preview width for mobile dialogs", () => {
    const tree = StitchSequencePreview({
      demoClip: null,
      isLoading: false,
      onLoadPreview: vi.fn(),
      posterUrl: "poster.jpg",
      stitch: createStitch(),
      ugcClip: null,
    }) as { props: Record<string, unknown> };

    expect(tree.props.className).toContain("w-full");
    expect(tree.props.className).toContain("max-w-[280px]");
    expect(tree.props.className).toContain("min-w-0");
  });
});
