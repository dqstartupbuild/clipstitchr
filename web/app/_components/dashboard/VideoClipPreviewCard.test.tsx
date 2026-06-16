import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoClipPreviewCard } from "@/app/_components/dashboard/VideoClipPreviewCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { CliprMetadata } from "@/lib/clipstitchr/types/CliprMetadata";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  actionContext: null as null | {
    closeDetails: () => void;
    isLoading: boolean;
    loadFullClip: () => Promise<VideoClip | null>;
    openDetails: (options?: {
      showControlsEditor?: boolean;
      showEditDialog?: boolean;
    }) => void;
  },
  detailsDialogProps: null as null | {
    initialControlsEditorOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onLoadPreview: () => void;
    posterUrl?: string | null;
    videoUrl?: string | null;
  },
  editDialogProps: null as null | {
    onClose: () => void;
    onLoadPreview: () => void;
    onSaveMetadata: (metadata: unknown) => Promise<void>;
  },
  lazyOptions: null as null | {
    cacheKey?: string;
    fallbackBlob?: Blob;
    loadBlob: () => Promise<Blob | null>;
  },
  lazyUrl: null as string | null,
  menuProps: null as null | {
    items: MediaCardActionMenuItem[];
    label: string;
  },
  selectionProps: null as null | {
    disabled?: boolean;
    isSelected: boolean;
    label: string;
    onClick: () => void;
  },
  setState: vi.fn(),
  stateQueue: [] as unknown[],
  useObjectUrl: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useState: (initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.setState,
    ],
  };
});

vi.mock("@/app/_components/dashboard/VideoClipDetailsDialog", () => ({
  VideoClipDetailsDialog: (props: typeof mocks.detailsDialogProps) => {
    mocks.detailsDialogProps = props;
    return "VideoClipDetailsDialog";
  },
}));

vi.mock("@/app/_components/dashboard/VideoClipEditDialog", () => ({
  VideoClipEditDialog: (props: typeof mocks.editDialogProps) => {
    mocks.editDialogProps = props;
    return "VideoClipEditDialog";
  },
}));

vi.mock("@/app/_components/ui/MediaCardActionMenu", () => ({
  MediaCardActionMenu: (props: typeof mocks.menuProps) => {
    mocks.menuProps = props;
    return "MediaCardActionMenu";
  },
}));

vi.mock("@/app/_components/ui/SelectionCheckboxButton", () => ({
  SelectionCheckboxButton: (props: typeof mocks.selectionProps) => {
    mocks.selectionProps = props;
    return "SelectionCheckboxButton";
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useLazyBlobObjectUrl", () => ({
  useLazyBlobObjectUrl: (options: typeof mocks.lazyOptions) => {
    mocks.lazyOptions = options;
    return mocks.lazyUrl;
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

function createCliprMetadata(
  overrides: Partial<CliprMetadata> = {},
): CliprMetadata {
  return {
    avatarId: "avatar_1",
    avatarPhotoId: "photo_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    finalDurationSeconds: 8,
    filledHook: "Stop scrolling",
    hookStyleKey: "direct",
    hookTemplateId: "hook_1",
    jobId: "job_1",
    productId: "product_1",
    productName: "Launch Kit",
    providerModels: ["model-a"],
    sceneCount: 2,
    script: "Script",
    targetDurationSeconds: 30,
    variablesUsed: {},
    voiceId: "voice_1",
    ...overrides,
  };
}

function createClipMetadata(
  overrides: Partial<VideoClipMetadata> = {},
): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    cliprMetadata: createCliprMetadata(),
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "UGC Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    performanceScore: {
      bestUse: "Use it as the first UGC clip.",
      fixes: ["Trim the pause at the start."],
      overall: 88,
      strengths: ["Clear face and product moment."],
      summary: "The first second gives people a reason to stay.",
    },
    posterObject: {
      contentType: "image/jpeg",
      key: "poster.jpg",
      size: 10,
    },
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "clip.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  };
}

function createFullClip(
  overrides: Partial<VideoClip> = {},
): VideoClip {
  return {
    ...createClipMetadata(),
    blob: new Blob(["clip"], { type: "video/mp4" }),
    ...overrides,
  } as VideoClip;
}

function getClipCacheKey(clip: VideoClipMetadata) {
  const musicObjectKey = clip.cliprMetadata?.music?.audioObject.key;
  const musicEnabled = clip.cliprMetadata?.music?.enabled;
  const musicUpdatedAt = clip.cliprMetadata?.music?.updatedAt;
  const musicVolume = clip.cliprMetadata?.music?.volume;

  return [
    clip.id,
    clip.updatedAt,
    musicEnabled,
    musicObjectKey,
    musicUpdatedAt,
    musicVolume,
  ].join(":");
}

function findElements(
  value: unknown,
  predicate: (element: { props?: Record<string, unknown>; type?: unknown }) => boolean,
): Array<{ props: Record<string, unknown>; type?: unknown }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => findElements(child, predicate));
  }

  const element = value as {
    props?: { children?: unknown };
    type?: unknown;
  };
  const matches = predicate(element as { props?: Record<string, unknown>; type?: unknown })
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [
    ...matches,
    ...findElements(element.props?.children, predicate),
  ];
}

describe("VideoClipPreviewCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.actionContext = null;
    mocks.detailsDialogProps = null;
    mocks.editDialogProps = null;
    mocks.lazyOptions = null;
    mocks.lazyUrl = "blob:poster";
    mocks.menuProps = null;
    mocks.selectionProps = null;
    mocks.stateQueue = [];
    mocks.useObjectUrl.mockReturnValue("blob:video");
  });

  it("renders poster, actions, footer, selection, and loads previews", async () => {
    const fullClip = createFullClip();
    const onLoadClip = vi.fn(async () => fullClip);
    const onLoadPoster = vi.fn(async () => new Blob(["poster"]));
    const onSelect = vi.fn();
    const actions = vi.fn((context: NonNullable<typeof mocks.actionContext>) => {
      mocks.actionContext = context;

      return [
        {
          icon: <span>Icon</span>,
          label: "Download",
          onClick: vi.fn(),
        },
      ];
    });
    const footer = vi.fn(() => <span>Footer</span>);

    const tree = VideoClipPreviewCard({
      actions,
      clip: createClipMetadata(),
      displayDuration: 4,
      footer,
      isSelectionDisabled: true,
      onLoadClip,
      onLoadPoster,
      onSelect,
    });
    const markup = renderToStaticMarkup(tree);

    expect(markup).toContain("blob:poster");
    expect(markup).toContain("Footer");
    expect(markup).toContain("Worth using");
    expect(markup).toContain("88");
    expect(mocks.menuProps?.items).toHaveLength(1);
    expect(mocks.selectionProps).toEqual(
      expect.objectContaining({
        disabled: true,
        isSelected: false,
        label: "Select UGC Clip",
      }),
    );

    await expect(mocks.lazyOptions?.loadBlob()).resolves.toBeInstanceOf(Blob);
    await expect(mocks.actionContext?.loadFullClip()).resolves.toBe(fullClip);
    mocks.actionContext?.openDetails({ showControlsEditor: true });

    const buttons = findElements(tree, (element) => element.type === "button");
    (buttons[0].props.onClick as () => void)();
    (buttons[1].props.onClick as () => void)();

    await Promise.resolve();

    expect(onLoadPoster).toHaveBeenCalledWith("clip_1");
    expect(onLoadClip).toHaveBeenCalledWith("clip_1");
    expect(mocks.setState).toHaveBeenCalledWith({
      cacheKey: getClipCacheKey(createClipMetadata()),
      clip: fullClip,
    });
    expect(mocks.setState).toHaveBeenCalledWith("controls");
    expect(mocks.setState).toHaveBeenCalledWith("details");
  });

  it("uses cached clips and handles missing loaded clips or poster loaders", async () => {
    const clip = createClipMetadata({ cliprMetadata: undefined });
    const fullClip = createFullClip(clip);
    const onLoadClip = vi.fn(async () => fullClip);

    mocks.stateQueue = [
      {
        cacheKey: getClipCacheKey(clip),
        clip: fullClip,
      },
      false,
      null,
    ];
    VideoClipPreviewCard({
      actions: (context) => {
        mocks.actionContext = context;
        return [];
      },
      clip,
      onLoadClip,
    });

    await expect(mocks.actionContext?.loadFullClip()).resolves.toBe(fullClip);
    await expect(mocks.lazyOptions?.loadBlob()).resolves.toBeNull();

    expect(onLoadClip).not.toHaveBeenCalled();
    expect(mocks.useObjectUrl).toHaveBeenCalledWith(fullClip.blob);

    mocks.lazyUrl = null;
    mocks.stateQueue = [null, false, null];
    const missingLoad = vi.fn(async () => null);
    const markup = renderToStaticMarkup(
      <VideoClipPreviewCard
        actions={(context) => {
          mocks.actionContext = context;
          return [];
        }}
        clip={clip}
        onLoadClip={missingLoad}
      />,
    );

    await expect(mocks.actionContext?.loadFullClip()).resolves.toBeNull();

    expect(markup).toContain("Video");
    expect(mocks.menuProps).toBeNull();
    expect(mocks.setState).toHaveBeenCalledWith(null);
  });

  it("renders details dialog controls and preview reload callbacks", async () => {
    const onLoadClip = vi.fn(async () => createFullClip());
    mocks.stateQueue = [null, true, "controls"];

    renderToStaticMarkup(
      <VideoClipPreviewCard
        clip={createClipMetadata()}
        cliprMusicEditor={{
          error: null,
          isSaving: false,
          onRemove: vi.fn(),
          onSave: vi.fn(),
        }}
        productName="Launch Kit"
        trimEditor={{
          initialTrimRange: { end: 8, start: 0 },
          onSave: vi.fn(),
          saveLabel: "Save",
          title: "Trim",
        }}
        onLoadClip={onLoadClip}
      />,
    );

    expect(mocks.detailsDialogProps).toEqual(
      expect.objectContaining({
        initialControlsEditorOpen: true,
        isLoading: true,
        posterUrl: "blob:poster",
        videoUrl: "blob:video",
      }),
    );

    mocks.detailsDialogProps?.onClose();
    mocks.detailsDialogProps?.onLoadPreview();

    await Promise.resolve();

    expect(mocks.setState).toHaveBeenCalledWith(null);
    expect(onLoadClip).toHaveBeenCalledWith("clip_1");
  });
});
