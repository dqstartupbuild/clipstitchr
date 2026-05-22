import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MusicSelectorDialog } from "@/app/_components/music/MusicSelectorDialog";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

vi.mock("@/app/_components/music/MusicTrackPreviewButton", () => ({
  MusicTrackPreviewButton: ({ track }: { track: SharedMusicTrack }) => (
    <button type="button">Preview {track.title}</button>
  ),
}));

function createTrack(overrides: Partial<SharedMusicTrack> = {}): SharedMusicTrack {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "users/user_123/music/track.mp3",
      size: 1234,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 32,
    id: "track_1",
    isOwnedByCurrentUser: true,
    mimeType: "audio/mpeg",
    prompt: "bright electronic",
    size: 1234,
    source: "stitchr",
    style: "upbeat",
    tags: ["electronic", "bright"],
    title: "Bright Hook",
    uploadedByOwnerId: "user_123",
    ...overrides,
  };
}

describe("MusicSelectorDialog", () => {
  it("renders matching tracks and selected state", () => {
    const markup = renderToStaticMarkup(
      <MusicSelectorDialog
        error={null}
        isGenerating={false}
        isLoading={false}
        selectedTrackId="track_1"
        tracks={[
          createTrack(),
          createTrack({
            id: "track_2",
            isOwnedByCurrentUser: false,
            tags: [],
            title: "Soft Demo",
          }),
        ]}
        onClose={vi.fn()}
        onGenerate={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(markup).toContain("Select music");
    expect(markup).toContain("Bright Hook");
    expect(markup).toContain("Soft Demo");
    expect(markup).toContain("Selected");
    expect(markup).toContain("Mine");
  });

  it("renders loading, error, and empty states", () => {
    const loadingMarkup = renderToStaticMarkup(
      <MusicSelectorDialog
        error={null}
        isGenerating={true}
        isLoading={true}
        tracks={[]}
        onClose={vi.fn()}
        onGenerate={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    const emptyMarkup = renderToStaticMarkup(
      <MusicSelectorDialog
        error="Unable to generate music."
        isGenerating={false}
        isLoading={false}
        tracks={[]}
        onClose={vi.fn()}
        onGenerate={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(loadingMarkup).toContain("Loading music");
    expect(emptyMarkup).toContain("Unable to generate music.");
    expect(emptyMarkup).toContain("No tracks found");
  });
});
