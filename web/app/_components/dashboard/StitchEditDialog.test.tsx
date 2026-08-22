import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StitchEditDialog } from "@/app/_components/dashboard/StitchEditDialog";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

vi.mock("@/app/_components/stitchr/TextOverlayEditor", () => ({
  TextOverlayEditor: ({ totalDuration }: { totalDuration: number }) => (
    <div data-total-duration={totalDuration} />
  ),
}));

vi.mock("@/app/_components/dashboard/StitchSequencePreview", () => ({
  StitchSequencePreview: () => <div />,
}));

vi.mock("@/app/_components/music/MusicSelectorButton", () => ({
  MusicSelectorButton: () => <div />,
}));

const sourceClip: VideoClipMetadata = {
  aspectRatio: 9 / 16,
  clipType: "ugc",
  createdAt: "2026-08-22T00:00:00.000Z",
  duration: 5,
  hasAudio: true,
  height: 1920,
  id: "ugc_1",
  libraryKind: "ugc",
  mimeType: "video/mp4",
  name: "Creator clip",
  originalName: "creator-clip.mp4",
  originalSize: 100,
  size: 100,
  sourceMimeType: "video/mp4",
  updatedAt: "2026-08-22T00:00:00.000Z",
  videoObject: { contentType: "video/mp4", key: "ugc_1.mp4", size: 100 },
  width: 1080,
};

const standaloneStitch: Stitch = {
  createdAt: "2026-08-22T00:00:00.000Z",
  demoClipId: "ugc_1",
  demoClipName: "Creator clip",
  duration: 5,
  height: 1920,
  id: "stitch_1",
  name: "Creator clip",
  sequenceSegments: [
    {
      clipId: "ugc_1",
      clipName: "Creator clip",
      clipType: "ugc",
      duration: 5,
      order: 0,
      trimRange: { end: 5, start: 0 },
    },
  ],
  ugcClipId: "ugc_1",
  ugcClipName: "Creator clip",
  width: 1080,
};

describe("StitchEditDialog", () => {
  it("uses one standalone sequence source for the text duration and summary", () => {
    const markup = renderToStaticMarkup(
      <StitchEditDialog
        demoClips={[sourceClip]}
        isLoadingPreview={false}
        isSavingMusic={false}
        isSavingSocialCaption={false}
        isSavingSourceSettings={false}
        isSavingText={false}
        musicError={null}
        posterUrl={null}
        previewErrorState={null}
        previewSources={null}
        sourceSettingsError={null}
        socialCaptionError={null}
        stitch={standaloneStitch}
        textError={null}
        ugcClips={[sourceClip]}
        onClose={vi.fn()}
        onLoadPreview={vi.fn()}
        onRemoveMusic={async () => undefined}
        onSaveMusic={async () => undefined}
        onSaveSocialCaption={async () => undefined}
        onSaveSourceSettings={async () => undefined}
        onSaveTextOverlay={async () => undefined}
      />,
    );

    expect(markup).toContain('data-total-duration="5"');
    expect(markup).toContain("00:05");
    expect(markup).toContain("Creator clip");
    expect(markup).toContain("Source 00:00 - 00:05 (00:05)");
    expect(markup).not.toContain("Creator clip to Creator clip");
  });
});
