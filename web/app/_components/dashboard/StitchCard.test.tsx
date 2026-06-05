import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StitchCard } from "@/app/_components/dashboard/StitchCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  actionItems: [] as MediaCardActionMenuItem[],
  capturePostHogException: vi.fn(),
  createStitchExportBlob: vi.fn(),
  detailsProps: null as null | {
    onClose: () => void;
    onLoadPreview: () => void;
  },
  downloadBlob: vi.fn(),
  editProps: null as null | {
    onClose: () => void;
    onGenerateMusic: () => Promise<StitchMusicMetadata | null>;
    onLoadPreview: () => void;
    onRemoveMusic: () => Promise<void>;
    onSaveMusic: (music: StitchMusicMetadata) => Promise<void>;
    onSaveSourceSettings: (
      update: StitchSourceSettingsUpdate,
    ) => Promise<void>;
    onSaveTextOverlay: (
      textOverlay: TextOverlay | TextOverlay[] | null,
      stitchOverride?: Stitch,
    ) => Promise<void>;
  },
  lazyObjectUrlOptions: null as null | { loadBlob: () => Promise<Blob | null> },
  musicProps: null as null | {
    onClose: () => void;
    onGenerate: () => Promise<StitchMusicMetadata | null>;
    onRemove: () => Promise<void>;
    onSave: (music: StitchMusicMetadata) => Promise<void>;
  },
  stateQueue: [] as unknown[],
  stateSetter: vi.fn(),
  textProps: null as null | {
    onClose: () => void;
    onSave: (textOverlay: TextOverlay | TextOverlay[] | null) => Promise<void>;
  },
  trackPostHogEvent: vi.fn(),
  useObjectUrl: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useState: (initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.stateSetter,
    ],
  };
});

vi.mock("@/app/_components/ui/MediaCardActionMenu", () => ({
  MediaCardActionMenu: ({ items }: { items: MediaCardActionMenuItem[] }) => {
    mocks.actionItems = items;
    return "MediaCardActionMenu";
  },
}));

vi.mock("@/app/_components/dashboard/StitchDetailsDialog", () => ({
  StitchDetailsDialog: (props: {
    onClose: () => void;
    onLoadPreview: () => void;
  }) => {
    mocks.detailsProps = props;
    return "StitchDetailsDialog";
  },
}));

vi.mock("@/app/_components/dashboard/StitchEditDialog", () => ({
  StitchEditDialog: (props: typeof mocks.editProps) => {
    mocks.editProps = props;
    return "StitchEditDialog";
  },
}));

vi.mock("@/app/_components/dashboard/StitchMusicSettingsDialog", () => ({
  StitchMusicSettingsDialog: (props: {
    onClose: () => void;
    onGenerate: () => Promise<StitchMusicMetadata | null>;
    onRemove: () => Promise<void>;
    onSave: (music: StitchMusicMetadata) => Promise<void>;
  }) => {
    mocks.musicProps = props;
    return "StitchMusicSettingsDialog";
  },
}));

vi.mock("@/app/_components/dashboard/StitchTextSettingsDialog", () => ({
  StitchTextSettingsDialog: (props: {
    onClose: () => void;
    onSave: (textOverlay: TextOverlay | TextOverlay[] | null) => Promise<void>;
  }) => {
    mocks.textProps = props;
    return "StitchTextSettingsDialog";
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

vi.mock("@/lib/clipstitchr/hooks/useLazyBlobObjectUrl", () => ({
  useLazyBlobObjectUrl: (options: { loadBlob: () => Promise<Blob | null> }) => {
    mocks.lazyObjectUrlOptions = options;
    return mocks.useObjectUrl(options);
  },
}));

vi.mock("@/lib/clipstitchr/client/createStitchExportBlob", () => ({
  createStitchExportBlob: mocks.createStitchExportBlob,
}));

vi.mock("@/lib/clipstitchr/utils/downloadBlob", () => ({
  downloadBlob: mocks.downloadBlob,
}));

vi.mock("@/lib/clipstitchr/analytics/capturePostHogException", () => ({
  capturePostHogException: mocks.capturePostHogException,
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
}));

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    duration: 12,
    id: "stitch_1",
    includeDemoAudio: true,
    includeUgcAudio: true,
    name: "Launch Stitch",
    size: 2048,
    textOverlay: {
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 5,
      fontSize: 48,
      startTime: 1,
      styleId: "hook",
      text: "Hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    },
    ugcClipId: "ugc_1",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  } as Stitch;
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
    volume: 1,
    ...overrides,
  };
}

function createClip(id: string): VideoClip {
  return {
    aspectRatio: 9 / 16,
    blob: new Blob([id], { type: "video/mp4" }),
    clipType: id.startsWith("demo") ? "demo" : "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 6,
    hasAudio: true,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name: id,
    originalName: `${id}.mp4`,
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `${id}.mp4`,
      size: 100,
    },
    width: 1080,
  };
}

function createSourceSettingsUpdate(): StitchSourceSettingsUpdate {
  return {
    demoClipId: "demo_2",
    demoClipName: "demo_2",
    demoPlaybackRate: 2,
    demoTrimRange: {
      end: 5,
      start: 1,
    },
    duration: 7,
    name: "updated-stitch.mp4",
    ugcClipId: "ugc_2",
    ugcClipName: "ugc_2",
    ugcPlaybackRate: 1,
    ugcTrimRange: {
      end: 3,
      start: 0,
    },
  };
}

type ElementLike = {
  props?: Record<string, unknown>;
  type?: unknown;
};

function collectElements(element: unknown): ElementLike[] {
  if (Array.isArray(element)) {
    return element.flatMap(collectElements);
  }

  if (
    !element ||
    typeof element !== "object" ||
    !("props" in element) ||
    !("type" in element)
  ) {
    return [];
  }

  const elementLike = element as ElementLike;

  return [elementLike, ...collectElements(elementLike.props?.children)];
}

describe("StitchCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.actionItems = [];
    mocks.detailsProps = null;
    mocks.editProps = null;
    mocks.lazyObjectUrlOptions = null;
    mocks.musicProps = null;
    mocks.textProps = null;
    mocks.stateQueue = [];
    mocks.useObjectUrl.mockReturnValue("blob:poster");
    mocks.createStitchExportBlob.mockResolvedValue(
      new Blob(["stitch"], { type: "video/mp4" }),
    );
  });

  it("renders stitch metadata and action menu items", () => {
    const markup = renderToStaticMarkup(
      <StitchCard
        stitch={createStitch()}
        onDelete={vi.fn()}
        onGenerateMusic={vi.fn()}
        onLoadClip={vi.fn()}
        onUpdateMusic={vi.fn()}
        onUpdatePostedStatus={vi.fn()}
        onUpdateSourceSettings={vi.fn()}
        onUpdateTextOverlay={vi.fn()}
      />,
    );

    expect(markup).toContain("Launch Stitch");
    expect(markup).toContain("STITCH");
    expect(markup).toContain("MediaCardActionMenu");
    expect(mocks.actionItems.map((item) => item.label)).toEqual([
      "Reuse in Stitchr",
      "Download stitch",
      "Edit stitch",
      "Mark as posted",
      "Delete stitch",
    ]);
  });

  it("opens details from card buttons and loads poster blobs", async () => {
    const onLoadPoster = vi.fn(async () => new Blob(["poster"]));
    const elements = collectElements(
      StitchCard({
        stitch: createStitch(),
        onDelete: vi.fn(),
        onGenerateMusic: vi.fn(),
        onLoadClip: vi.fn(),
        onLoadPoster,
        onUpdateMusic: vi.fn(),
        onUpdatePostedStatus: vi.fn(),
        onUpdateSourceSettings: vi.fn(),
        onUpdateTextOverlay: vi.fn(),
      }),
    );

    for (const button of elements.filter((element) => element.type === "button")) {
      (button.props?.onClick as (() => void) | undefined)?.();
    }
    await expect(mocks.lazyObjectUrlOptions?.loadBlob()).resolves.toEqual(
      expect.any(Blob),
    );

    expect(onLoadPoster).toHaveBeenCalledWith("stitch_1");
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "stitch_preview_viewed",
      expect.objectContaining({
        stitch_id: "stitch_1",
      }),
    );
  });

  it("invokes preview, download, music, text, and delete flows", async () => {
    const onDelete = vi.fn();
    const onGenerateMusic = vi.fn(async () => createStitchMusic());
    const onLoadClip = vi.fn(async (id: string) => createClip(id));
    const onUpdateMusic = vi.fn(async () => undefined);
    const onUpdatePostedStatus = vi.fn(async () => undefined);
    const onUpdateSourceSettings = vi.fn(async () => undefined);
    const onUpdateTextOverlay = vi.fn(async () => undefined);

    mocks.stateQueue = [
      null,
      null,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];

    renderToStaticMarkup(
      <StitchCard
        stitch={createStitch()}
        onDelete={onDelete}
        onGenerateMusic={onGenerateMusic}
        onLoadClip={onLoadClip}
        onUpdateMusic={onUpdateMusic}
        onUpdatePostedStatus={onUpdatePostedStatus}
        onUpdateSourceSettings={onUpdateSourceSettings}
        onUpdateTextOverlay={onUpdateTextOverlay}
      />,
    );

    mocks.detailsProps?.onLoadPreview();
    mocks.detailsProps?.onClose();
    mocks.actionItems.find((item) => item.label === "Edit stitch")?.onClick?.();
    await mocks.editProps?.onGenerateMusic();
    await mocks.editProps?.onSaveMusic(createStitchMusic());
    await mocks.editProps?.onRemoveMusic();
    await mocks.editProps?.onSaveSourceSettings(createSourceSettingsUpdate());
    await mocks.editProps?.onSaveTextOverlay(null);
    mocks.editProps?.onClose();
    mocks.actionItems.find((item) => item.label === "Mark as posted")?.onClick?.();
    mocks.actionItems.find((item) => item.label === "Download stitch")?.onClick?.();
    mocks.actionItems.find((item) => item.label === "Delete stitch")?.onClick?.();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(onLoadClip).toHaveBeenCalledWith("ugc_1");
    expect(onLoadClip).toHaveBeenCalledWith("demo_1");
    expect(onGenerateMusic).toHaveBeenCalled();
    expect(onUpdateMusic).toHaveBeenCalled();
    expect(onUpdatePostedStatus).toHaveBeenCalledWith(createStitch(), true);
    expect(onUpdateSourceSettings).toHaveBeenCalledWith(
      createStitch(),
      createSourceSettingsUpdate(),
    );
    expect(onUpdateTextOverlay).toHaveBeenCalledWith(createStitch(), null);
    expect(mocks.createStitchExportBlob).toHaveBeenCalled();
    expect(mocks.downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      "Launch Stitch",
    );
    expect(onDelete).toHaveBeenCalledWith("stitch_1");
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "stitch_deleted",
      expect.objectContaining({
        stitch_id: "stitch_1",
      }),
    );
  });

  it("captures download and generation errors", async () => {
    mocks.createStitchExportBlob.mockRejectedValueOnce(new Error("Export failed"));
    const onGenerateMusic = vi.fn(async () => {
      throw new Error("Music failed");
    });
    mocks.stateQueue = [
      null,
      null,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      null,
      null,
      null,
      null,
      null,
    ];

    renderToStaticMarkup(
      <StitchCard
        stitch={createStitch()}
        onDelete={vi.fn()}
        onGenerateMusic={onGenerateMusic}
        onLoadClip={vi.fn()}
        onUpdateMusic={vi.fn()}
        onUpdatePostedStatus={vi.fn()}
        onUpdateSourceSettings={vi.fn()}
        onUpdateTextOverlay={vi.fn()}
      />,
    );

    await mocks.editProps?.onGenerateMusic();
    mocks.actionItems.find((item) => item.label === "Download stitch")?.onClick?.();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.capturePostHogException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        feature: "stitch_download",
      }),
    );
  });

  it("surfaces preview, music update, and text update failures", async () => {
    const onLoadClip = vi.fn(async () => null);
    const onUpdateMusic = vi.fn(async () => {
      throw new Error("music update failed");
    });
    const onUpdateSourceSettings = vi.fn(async () => {
      throw new Error("source update failed");
    });
    const onUpdateTextOverlay = vi.fn(async () => {
      throw new Error("text update failed");
    });

    mocks.stateQueue = [
      null,
      null,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      null,
      null,
      null,
      null,
      null,
    ];

    renderToStaticMarkup(
      <StitchCard
        stitch={createStitch()}
        onDelete={vi.fn()}
        onGenerateMusic={vi.fn()}
        onLoadClip={onLoadClip}
        onUpdateMusic={onUpdateMusic}
        onUpdatePostedStatus={vi.fn()}
        onUpdateSourceSettings={onUpdateSourceSettings}
        onUpdateTextOverlay={onUpdateTextOverlay}
      />,
    );

    mocks.detailsProps?.onLoadPreview();
    await expect(mocks.editProps?.onSaveMusic(createStitchMusic())).rejects.toThrow(
      "music update failed",
    );
    await expect(
      mocks.editProps?.onSaveSourceSettings(createSourceSettingsUpdate()),
    ).rejects.toThrow("source update failed");
    await expect(mocks.editProps?.onSaveTextOverlay(null)).rejects.toThrow(
      "text update failed",
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onLoadClip).toHaveBeenCalledWith("ugc_1");
    expect(onUpdateMusic).toHaveBeenCalled();
    expect(onUpdateSourceSettings).toHaveBeenCalled();
    expect(onUpdateTextOverlay).toHaveBeenCalled();
  });
});
