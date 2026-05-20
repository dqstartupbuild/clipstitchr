import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MusicTrackPreviewButton } from "@/app/_components/music/MusicTrackPreviewButton";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

vi.mock("@/app/_components/ui/IconButton", () => ({
  IconButton: ({
    className,
    disabled,
    label,
  }: {
    className?: string;
    disabled?: boolean;
    label: string;
  }) => `IconButton:${label}:${Boolean(disabled)}:${className ?? ""}`,
}));

vi.mock("@/lib/clipstitchr/client/r2/downloadMusicBlob", () => ({
  downloadMusicBlob: vi.fn(),
}));

function createTrack(): SharedMusicTrack {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "shared/music/track.mp3",
      size: 100,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    durationSeconds: 30,
    id: "track_1",
    isOwnedByCurrentUser: false,
    mimeType: "audio/mpeg",
    size: 100,
    source: "library",
    tags: ["upbeat"],
    title: "Upbeat Launch",
    uploadedByOwnerId: "owner_1",
  };
}

describe("MusicTrackPreviewButton", () => {
  it("renders an idle preview button for the track", () => {
    expect(
      renderToStaticMarkup(<MusicTrackPreviewButton track={createTrack()} />),
    ).toContain("IconButton:Preview Upbeat Launch:false:");
  });
});
