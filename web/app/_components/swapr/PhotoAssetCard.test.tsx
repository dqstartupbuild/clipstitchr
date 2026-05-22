import { beforeEach, describe, expect, it, vi } from "vitest";
import { PhotoAssetCard } from "@/app/_components/swapr/PhotoAssetCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type ElementLike = {
  props?: Record<string, unknown>;
  type?: unknown;
};

const mocks = vi.hoisted(() => ({
  downloadBlob: vi.fn(),
  stateQueue: [] as unknown[],
  stateSetter: vi.fn(),
  useObjectUrl: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: (initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.stateSetter,
    ],
  };
});

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

vi.mock("@/lib/clipstitchr/utils/downloadBlob", () => ({
  downloadBlob: mocks.downloadBlob,
}));

function createPhoto(overrides: Partial<PhotoAssetMetadata> = {}) {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1920,
    id: "photo_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "photos/photo_1.jpg",
      size: 2048,
    },
    locationDescription: "Studio",
    mimeType: "image/jpeg",
    name: "Studio photo",
    outfitDescription: "Blue jacket",
    poseDescription: "Pointing",
    size: 2048,
    tags: ["photo"],
    thumbnailBlob: new Blob(["thumbnail"], { type: "image/jpeg" }),
    updatedAt: "2026-05-20T00:00:00.000Z",
    width: 1080,
    ...overrides,
  } as PhotoAssetMetadata;
}

function createLoadedPhoto(overrides: Partial<PhotoAsset> = {}) {
  return {
    ...createPhoto(),
    blob: new Blob(["photo"], { type: "image/png" }),
    ...overrides,
  } as PhotoAsset;
}

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

function renderCard(
  props: Partial<Parameters<typeof PhotoAssetCard>[0]> = {},
) {
  return collectElements(
    PhotoAssetCard({
      photo: createPhoto(),
      ...props,
    }),
  );
}

function findAction(
  elements: ElementLike[],
  label: string,
): MediaCardActionMenuItem {
  const menu = elements.find((element) => Array.isArray(element.props?.items));
  const item = (menu?.props?.items as MediaCardActionMenuItem[]).find(
    (item) => item.label === label,
  );

  if (!item) {
    throw new Error(`Missing action ${label}.`);
  }

  return item;
}

describe("PhotoAssetCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.stateQueue = [];
    mocks.useObjectUrl.mockReturnValue("blob:thumbnail");
  });

  it("renders selected photo actions and handles selection, edit, delete, and download", async () => {
    const onDelete = vi.fn();
    const onLoadPhoto = vi.fn(async () => createLoadedPhoto());
    const onSelect = vi.fn();
    const onUpdateMetadata = vi.fn(async () => undefined);
    mocks.stateQueue = [true, true, false];

    const elements = renderCard({
      avatarName: "Ava",
      isSelected: true,
      onDelete,
      onLoadPhoto,
      onSelect,
      onUpdateMetadata,
    });
    const selection = elements.find((element) =>
      String(element.props?.label).startsWith("Deselect"),
    );
    const buttons = elements.filter((element) => element.type === "button");
    const metadataDialog = elements.find(
      (element) => element.props?.requiredTag === "photo",
    );
    const detailsDialog = elements.find((element) => "photo" in (element.props ?? {}));

    for (const button of buttons) {
      (button.props?.onClick as (() => void) | undefined)?.();
    }
    (selection?.props?.onClick as (() => void) | undefined)?.();
    findAction(elements, "Edit photo details").onClick?.();
    findAction(elements, "Delete photo").onClick?.();
    findAction(elements, "Download photo").onClick?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (metadataDialog?.props?.onSave as (
      metadata: AssetMetadataUpdate,
    ) => Promise<void>)({
      name: "Updated photo",
      tags: ["photo", "edited"],
    });
    (metadataDialog?.props?.onClose as (() => void) | undefined)?.();
    (detailsDialog?.props?.onClose as (() => void) | undefined)?.();

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "photo_1" }));
    expect(onDelete).toHaveBeenCalledWith("photo_1");
    expect(onLoadPhoto).toHaveBeenCalledWith("photo_1");
    expect(mocks.downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      "studio-photo.png",
    );
    expect(onUpdateMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ id: "photo_1" }),
      {
        name: "Updated photo",
        tags: ["photo", "edited"],
      },
    );
  });

  it("skips download when the full photo cannot be loaded", async () => {
    const elements = renderCard({
      onLoadPhoto: vi.fn(async () => null),
    });

    findAction(elements, "Download photo").onClick?.();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.downloadBlob).not.toHaveBeenCalled();
  });

  it("renders a compact card without optional actions or thumbnail URL", () => {
    mocks.useObjectUrl.mockReturnValue(null);

    const elements = renderCard({
      avatarName: undefined,
      onDelete: undefined,
      onLoadPhoto: undefined,
      onSelect: undefined,
      onUpdateMetadata: undefined,
      showDownload: false,
      showUseInSwapr: false,
    });
    const menu = elements.find((element) => Array.isArray(element.props?.items));

    expect(menu?.props?.items).toEqual([]);
    expect(
      elements.some((element) => String(element.props?.children).includes("Photo")),
    ).toBe(true);
  });
});
