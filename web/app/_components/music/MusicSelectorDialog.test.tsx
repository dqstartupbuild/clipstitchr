import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MusicSelectorDialog } from "@/app/_components/music/MusicSelectorDialog";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";

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

function renderDialog(
  overrides: Partial<React.ComponentProps<typeof MusicSelectorDialog>> = {},
) {
  return renderToStaticMarkup(
    <MusicSelectorDialog
      error={null}
      isLoading={false}
      isRightsAccepted={true}
      isRightsLoading={false}
      isRightsSaving={false}
      isSearchingTikTok={false}
      isSavingTikTokSound={false}
      isUploading={false}
      tiktokCandidates={[]}
      tracks={[]}
      onAcceptRights={vi.fn()}
      onClose={vi.fn()}
      onImportTikTokSound={vi.fn()}
      onSearchTikTokSounds={vi.fn()}
      onSelect={vi.fn()}
      onUpload={vi.fn()}
      {...overrides}
    />,
  );
}

describe("MusicSelectorDialog", () => {
  it("bounds the dialog to the viewport with one scrollable content area", () => {
    const markup = renderDialog();

    expect(markup).toContain("max-h-[calc(100dvh-1.5rem)]");
    expect(markup).toContain("sm:max-h-[calc(100dvh-3rem)]");
    expect(markup).toContain("min-h-0 overflow-y-auto");
  });

  it("renders matching tracks and selected state", () => {
    const markup = renderDialog({
      selectedTrackId: "track_1",
      tracks: [
        createTrack(),
        createTrack({
          id: "track_2",
          source: "tiktok",
          tags: [],
          title: "Soft Demo",
        }),
      ],
    });

    expect(markup).toContain("Add a sound");
    expect(markup).toContain("Bright Hook");
    expect(markup).toContain("Soft Demo");
    expect(markup).toContain("Selected");
    expect(markup).toContain("TikTok");
  });

  it("renders TikTok candidates", () => {
    const candidates: TikTokSoundCandidate[] = [
      {
        author: "Creator",
        playCount: 1200,
        sourceUrl: "https://www.tiktok.com/@creator/video/1",
        title: "Trend Sound",
      },
    ];
    const markup = renderDialog({ tiktokCandidates: candidates });

    expect(markup).toContain("Trend Sound");
    expect(markup).toContain("Creator");
    expect(markup).toContain("Save");
  });

  it("renders loading, error, and empty states", () => {
    const loadingMarkup = renderDialog({ isLoading: true, isUploading: true });
    const emptyMarkup = renderDialog({ error: "Unable to upload sound." });

    expect(loadingMarkup).toContain("Loading sounds");
    expect(emptyMarkup).toContain("Unable to upload sound.");
    expect(emptyMarkup).toContain("No sounds found");
  });
});
