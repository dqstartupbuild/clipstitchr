import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadStitchCard } from "@/app/_components/stitchr/DownloadStitchCard";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

const mocks = vi.hoisted(() => ({
  createStitchExportBlob: vi.fn(),
  downloadBlob: vi.fn(),
  setState: vi.fn(),
  stateQueue: [] as unknown[],
  useObjectUrl: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: (initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.setState,
    ],
  };
});

vi.mock("@/lib/clipstitchr/client/createStitchExportBlob", () => ({
  createStitchExportBlob: mocks.createStitchExportBlob,
}));

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

vi.mock("@/lib/clipstitchr/utils/downloadBlob", () => ({
  downloadBlob: mocks.downloadBlob,
}));

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 12,
    height: 1920,
    id: "stitch_1",
    name: "Finished Stitch.mp4",
    posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
    size: 1024,
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    width: 1080,
    ...overrides,
  };
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

describe("DownloadStitchCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.stateQueue = [];
    mocks.useObjectUrl.mockReturnValue("blob:poster");
    mocks.createStitchExportBlob.mockResolvedValue(
      new Blob(["stitch"], { type: "video/mp4" }),
    );
  });

  it("downloads stitch exports with poster and file size metadata", async () => {
    const onLoadClip = vi.fn();
    const tree = DownloadStitchCard({
      onLoadClip,
      stitch: createStitch(),
    });
    const markup = renderToStaticMarkup(tree);
    const [button] = findElements(tree, (element) => element.type === "button");

    (button.props.onClick as () => void)();

    for (let index = 0; index < 3; index += 1) {
      await Promise.resolve();
    }

    expect(markup).toContain("blob:poster");
    expect(markup).toContain("1.0 KB");
    expect(mocks.createStitchExportBlob).toHaveBeenCalledWith(createStitch(), {
      loadClip: onLoadClip,
    });
    expect(mocks.downloadBlob).toHaveBeenCalledWith(
      expect.any(Blob),
      "Finished Stitch.mp4",
    );
    expect(mocks.setState).toHaveBeenCalledWith(false);
  });

  it("renders ready/error states and reports export failures", async () => {
    mocks.useObjectUrl.mockReturnValue(null);
    mocks.stateQueue = [true, "Previous error"];
    const busyMarkup = renderToStaticMarkup(
      <DownloadStitchCard
        stitch={createStitch({ posterBlob: undefined, size: undefined })}
        onLoadClip={vi.fn()}
      />,
    );

    expect(busyMarkup).toContain("Ready to download");
    expect(busyMarkup).toContain("Previous error");
    expect(busyMarkup).toContain("disabled");

    mocks.stateQueue = [];
    mocks.createStitchExportBlob.mockRejectedValueOnce(new Error("Export failed"));
    const errorTree = DownloadStitchCard({
      onLoadClip: vi.fn(),
      stitch: createStitch(),
    });
    const [errorButton] = findElements(
      errorTree,
      (element) => element.type === "button",
    );

    (errorButton.props.onClick as () => void)();

    for (let index = 0; index < 3; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.setState).toHaveBeenCalledWith("Export failed");

    mocks.createStitchExportBlob.mockRejectedValueOnce("bad export");
    const fallbackTree = DownloadStitchCard({
      onLoadClip: vi.fn(),
      stitch: createStitch(),
    });
    const [fallbackButton] = findElements(
      fallbackTree,
      (element) => element.type === "button",
    );

    (fallbackButton.props.onClick as () => void)();

    for (let index = 0; index < 3; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.setState).toHaveBeenCalledWith(
      "Unable to export this stitch.",
    );
  });
});
