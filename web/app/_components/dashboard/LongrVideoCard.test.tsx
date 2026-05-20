import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LongrVideoCard } from "@/app/_components/dashboard/LongrVideoCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import type { LongrVideoMetadata } from "@/lib/clipstitchr/types/LongrVideoMetadata";

const mocks = vi.hoisted(() => ({
  actionItems: [] as MediaCardActionMenuItem[],
  createVideoBlobWithPosterMetadata: vi.fn(),
  detailsProps: null as null | {
    videoUrl: string | null;
  },
  downloadBlob: vi.fn(),
  stateQueue: [] as unknown[],
  stateSetter: vi.fn(),
  useLazyBlobObjectUrl: vi.fn(),
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

vi.mock("@/app/_components/ui/MediaCardActionMenu", () => ({
  MediaCardActionMenu: ({ items }: { items: MediaCardActionMenuItem[] }) => {
    mocks.actionItems = items;
    return "MediaCardActionMenu";
  },
}));

vi.mock("@/app/_components/dashboard/LongrVideoDetailsDialog", () => ({
  LongrVideoDetailsDialog: (props: { videoUrl: string | null }) => {
    mocks.detailsProps = props;
    return "LongrVideoDetailsDialog";
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useLazyBlobObjectUrl", () => ({
  useLazyBlobObjectUrl: mocks.useLazyBlobObjectUrl,
}));

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

vi.mock("@/lib/clipstitchr/media/createVideoBlobWithPosterMetadata", () => ({
  createVideoBlobWithPosterMetadata: mocks.createVideoBlobWithPosterMetadata,
}));

vi.mock("@/lib/clipstitchr/utils/downloadBlob", () => ({
  downloadBlob: mocks.downloadBlob,
}));

function createLongrVideoMetadata(
  overrides: Partial<LongrVideoMetadata> = {},
): LongrVideoMetadata {
  return {
    id: "longr_1",
    name: "Launch Long",
    clipSegments: [],
    longrObject: {
      contentType: "video/mp4",
      key: "longr.mp4",
      size: 200,
    },
    posterObject: {
      contentType: "image/jpeg",
      key: "poster.jpg",
      size: 20,
    },
    mimeType: "video/mp4",
    size: 200,
    width: 1080,
    height: 1920,
    duration: 60,
    createdAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

function createLongrVideo(): LongrVideo {
  return {
    ...createLongrVideoMetadata(),
    blob: new Blob(["longr"], { type: "video/mp4" }),
    posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
  };
}

describe("LongrVideoCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.actionItems = [];
    mocks.detailsProps = null;
    mocks.stateQueue = [];
    mocks.useLazyBlobObjectUrl.mockReturnValue("blob:poster");
    mocks.useObjectUrl.mockReturnValue("blob:video");
    mocks.createVideoBlobWithPosterMetadata.mockResolvedValue(
      new Blob(["export"], { type: "video/mp4" }),
    );
  });

  it("lazy-loads the Long before download", async () => {
    const onDelete = vi.fn();
    const onLoadLongrVideo = vi.fn(async () => createLongrVideo());

    const markup = renderToStaticMarkup(
      <LongrVideoCard
        longrVideo={createLongrVideoMetadata()}
        onDelete={onDelete}
        onLoadLongrVideo={onLoadLongrVideo}
        onLoadPoster={vi.fn()}
      />,
    );

    expect(markup).toContain("Launch Long");
    mocks.actionItems.find((item) => item.label === "Download Long")?.onClick?.();
    mocks.actionItems.find((item) => item.label === "Delete Long")?.onClick?.();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(onLoadLongrVideo).toHaveBeenCalledWith("longr_1");
    expect(mocks.createVideoBlobWithPosterMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        posterBlob: expect.any(Blob),
        title: "Launch Long",
        videoBlob: expect.any(Blob),
      }),
    );
    expect(mocks.downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      "Launch Long",
    );
    expect(onDelete).toHaveBeenCalledWith("longr_1");
  });

  it("renders details with the loaded video URL", () => {
    mocks.stateQueue = [createLongrVideo(), true, false, false, null];

    renderToStaticMarkup(
      <LongrVideoCard
        longrVideo={createLongrVideoMetadata()}
        onDelete={vi.fn()}
        onLoadLongrVideo={vi.fn()}
      />,
    );

    expect(mocks.detailsProps?.videoUrl).toBe("blob:video");
  });
});
