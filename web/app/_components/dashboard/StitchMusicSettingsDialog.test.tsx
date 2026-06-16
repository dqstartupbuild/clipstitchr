import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StitchMusicSettingsDialog } from "@/app/_components/dashboard/StitchMusicSettingsDialog";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";

const mocks = vi.hoisted(() => ({
  buttons: [] as Array<{ label: string; onClick?: () => void }>,
  iconButtonProps: null as { onClick?: () => void } | null,
  musicSelectorProps: null as {
    onSelectTrack: (track: SharedMusicTrack) => void | Promise<void>;
  } | null,
}));

vi.mock("@/app/_components/ui/Button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => {
    mocks.buttons.push({ label: String(children), onClick });
    return <button type="button">{children}</button>;
  },
}));

vi.mock("@/app/_components/ui/IconButton", () => ({
  IconButton: (props: { label: string; onClick?: () => void }) => {
    mocks.iconButtonProps = props;
    return <button type="button">{props.label}</button>;
  },
}));

vi.mock("@/app/_components/music/MusicSelectorButton", () => ({
  MusicSelectorButton: (props: {
    onSelectTrack: (track: SharedMusicTrack) => void | Promise<void>;
  }) => {
    mocks.musicSelectorProps = props;
    return "MusicSelectorButton";
  },
}));

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    duration: 10,
    id: "stitch_1",
    includeDemoAudio: true,
    includeUgcAudio: true,
    name: "Launch stitch",
    ugcClipId: "ugc_1",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  } as Stitch;
}

function createTrack(): SharedMusicTrack {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "music.mp3",
      size: 100,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    id: "track_1",
    isOwnedByCurrentUser: false,
    mimeType: "audio/mpeg",
    size: 100,
    source: "library",
    tags: ["upbeat"],
    title: "Track",
    uploadedByOwnerId: "user_1",
  };
}

function createStitchMusic(
  overrides: Partial<StitchMusicMetadata> = {},
): StitchMusicMetadata {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "music.mp3",
      size: 100,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 30,
    enabled: true,
    prompt: "Upbeat stitch music",
    providerModel: "music-model",
    providerPredictionId: "prediction_1",
    title: "Music",
    updatedAt: "2026-05-20T00:00:00.000Z",
    volume: 0.8,
    ...overrides,
  };
}

describe("StitchMusicSettingsDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buttons = [];
    mocks.iconButtonProps = null;
    mocks.musicSelectorProps = null;
  });

  it("renders existing music controls and invokes music callbacks", async () => {
    const onClose = vi.fn();
    const onRemove = vi.fn(async () => undefined);
    const onSave = vi.fn(async () => undefined);
    const markup = renderToStaticMarkup(
      <StitchMusicSettingsDialog
        stitch={createStitch({
          music: createStitchMusic(),
        })}
        error="Music unavailable."
        isSaving={false}
        onClose={onClose}
        onRemove={onRemove}
        onSave={onSave}
      />,
    );

    expect(markup).toContain("Launch stitch");
    expect(markup).toContain("Music unavailable.");
    expect(markup).toContain("80%");

    mocks.iconButtonProps?.onClick?.();
    await mocks.buttons.find((button) => button.label === "Remove music")
      ?.onClick?.();
    await mocks.buttons.find((button) => button.label === "Save settings")
      ?.onClick?.();
    await mocks.musicSelectorProps?.onSelectTrack(createTrack());

    expect(onClose).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });

  it("renders the empty state when no music is attached", () => {
    const markup = renderToStaticMarkup(
      <StitchMusicSettingsDialog
        stitch={createStitch()}
        error={null}
        isSaving={false}
        onClose={vi.fn()}
        onRemove={vi.fn(async () => undefined)}
        onSave={vi.fn(async () => undefined)}
      />,
    );

    expect(markup).toContain("No music is attached to this stitch.");
    expect(markup).toContain("MusicSelectorButton");
  });
});
