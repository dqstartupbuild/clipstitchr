import { beforeEach, describe, expect, it, vi } from "vitest";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";

const mocks = vi.hoisted(() => ({
  clickFileInput: vi.fn(),
  processFiles: vi.fn(),
  processorError: null as string | null,
  queue: [] as unknown[],
  setClipType: vi.fn(),
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useRef: () => ({ current: { click: mocks.clickFileInput } }),
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock("@/lib/clipstitchr/hooks/useUploadProcessor", () => ({
  useUploadProcessor: () => ({
    error: mocks.processorError,
    isProcessing: false,
    processFiles: mocks.processFiles,
    queue: mocks.queue,
    setClipType: mocks.setClipType,
  }),
}));

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
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
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

function createFile(type: string) {
  return {
    name: `asset.${type.includes("image") ? "jpg" : "mp4"}`,
    type,
  } as File;
}

describe("UploadPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.processorError = null;
    mocks.queue = [];
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
  });

  it("updates upload type, opens the file input, and processes video files", () => {
    const onAssetTypeChange = vi.fn();
    const videoFile = createFile("video/mp4");

    mocks.stateQueue = [false, null, false];

    const tree = UploadPanel({
      isPhotoUploading: false,
      onAssetTypeChange,
      onPhotoUploaded: vi.fn(),
      onUploaded: vi.fn(),
    });
    const [tabs] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "UploadAssetTabs",
    );
    const [chooseButton] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "Button" &&
        element.props?.children === "Choose Files",
    );
    const [fileInput] = findElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "file",
    );

    (tabs.props.onChange as (assetType: string) => void)("demo");
    (chooseButton.props.onClick as () => void)();
    (fileInput.props.onChange as (event: {
      target: { files: File[]; value: string };
    }) => void)({
      target: {
        files: [videoFile],
        value: "selected",
      },
    });

    expect(onAssetTypeChange).toHaveBeenCalledWith("demo");
    expect(mocks.setClipType).toHaveBeenCalledWith("demo");
    expect(mocks.clickFileInput).toHaveBeenCalledOnce();
    expect(mocks.processFiles).toHaveBeenCalledWith([videoFile]);
  });

  it("uploads photos with the AI expansion preference and rejects invalid files", () => {
    const onPhotoExpandPreferenceChange = vi.fn();
    const onPhotoUploaded = vi.fn();
    const photoFile = createFile("image/jpeg");
    const videoFile = createFile("video/mp4");

    mocks.stateQueue = [false, null, true];

    const tree = UploadPanel({
      allowedAssetTypes: ["photo"],
      initialAssetType: "photo",
      isPhotoUploading: false,
      onPhotoExpandPreferenceChange,
      onPhotoUploaded,
      onUploaded: vi.fn(),
    });
    const [checkbox] = findElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "checkbox",
    );
    const [fileInput] = findElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "file",
    );

    (checkbox.props.onChange as (event: {
      currentTarget: { checked: boolean };
    }) => void)({ currentTarget: { checked: false } });
    (fileInput.props.onChange as (event: {
      target: { files: File[]; value: string };
    }) => void)({
      target: {
        files: [videoFile],
        value: "invalid",
      },
    });
    (fileInput.props.onChange as (event: {
      target: { files: File[]; value: string };
    }) => void)({
      target: {
        files: [photoFile],
        value: "valid",
      },
    });

    expect(onPhotoExpandPreferenceChange).toHaveBeenCalledWith(false);
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith("Choose JPG or PNG photos.");
    expect(onPhotoUploaded).toHaveBeenCalledWith([photoFile], {
      shouldExpandWithAi: true,
    });
  });

  it("blocks demo uploads when a product is required", () => {
    const videoFile = createFile("video/mp4");

    mocks.stateQueue = [false, null, false];

    const tree = UploadPanel({
      canUploadDemo: false,
      demoUploadBlockedMessage: "Choose a product first.",
      initialAssetType: "demo",
      isPhotoUploading: false,
      onPhotoUploaded: vi.fn(),
      onUploaded: vi.fn(),
    });
    const [fileInput] = findElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "file",
    );

    (fileInput.props.onChange as (event: {
      target: { files: File[]; value: string };
    }) => void)({
      target: {
        files: [videoFile],
        value: "selected",
      },
    });

    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith("Choose a product first.");
    expect(mocks.processFiles).not.toHaveBeenCalled();
  });
});
