import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateAvatarFromClipDialog } from "@/app/_components/dashboard/CreateAvatarFromClipDialog";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

const mocks = vi.hoisted(() => ({
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  trackPostHogEvent: vi.fn(),
  useObjectUrl: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock("@/lib/clipstitchr/hooks/useObjectUrl", () => ({
  useObjectUrl: mocks.useObjectUrl,
}));

vi.mock("@/lib/clipstitchr/analytics/trackPostHogEvent", () => ({
  trackPostHogEvent: mocks.trackPostHogEvent,
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

function createClip(overrides: Partial<VideoClipMetadata> = {}): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mainPersonDescription: "Person with short hair",
    mimeType: "video/mp4",
    name: "UGC Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    poseDescription: "Holding the product",
    posterBlob: new Blob(["poster"], { type: "image/jpeg" }),
    size: 100,
    sourceMimeType: "video/mp4",
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

describe("CreateAvatarFromClipDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.useObjectUrl.mockReturnValue("blob:poster");
  });

  it("submits avatar options, tracks creation, and closes on success", async () => {
    const onClose = vi.fn();
    const onCreate = vi.fn(async () => true);

    mocks.stateQueue = [
      "Person",
      "Launch avatar",
      "Holding product",
      3,
      "similar",
      "any",
      "Studio",
      "ugc",
    ];

    const tree = CreateAvatarFromClipDialog({
      clip: createClip(),
      error: null,
      isGenerating: false,
      onClose,
      onCreate,
    });
    const root = findElements(
      tree,
      (element) =>
        element.type === "div" &&
        String(element.props?.className).includes(
          "dashboard-dialog-viewport",
        ),
    )[0];
    const form = findElements(tree, (element) => element.type === "form")[0];
    const iconButton = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "IconButton",
    )[0];
    const inputs = findElements(tree, (element) => element.type === "input");
    const textareas = findElements(
      tree,
      (element) => element.type === "textarea",
    );
    const nativeButtons = findElements(
      tree,
      (element) => element.type === "button",
    );
    const selectInputs = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "SelectInput",
    );
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    (root.props.onClick as () => void)();
    (form.props.onClick as (event: { stopPropagation: () => void }) => void)({
      stopPropagation,
    });
    (iconButton.props.onClick as () => void)();

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(stopPropagation).toHaveBeenCalledOnce();

    (inputs[0].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "New avatar" } });
    (textareas[0].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "Updated person" } });
    (inputs[1].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "Kitchen" } });
    (inputs[2].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "Pouring coffee" } });
    (nativeButtons.find((button) => button.props.children === "Same person")
      ?.props.onClick as () => void)();
    (nativeButtons.find((button) => button.props.children === 5)?.props
      .onClick as () => void)();
    (selectInputs[0].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "cinematic" } });
    (selectInputs[1].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "studio" } });

    await (form.props.onSubmit as (event: {
      preventDefault: () => void;
    }) => Promise<void>)({ preventDefault });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onCreate).toHaveBeenCalledWith({
      avatarDescription: "Person",
      avatarName: "Launch avatar",
      context: "Holding product",
      count: 3,
      identityMode: "similar",
      lighting: "any",
      location: "Studio",
      style: "ugc",
    });
    expect(mocks.trackPostHogEvent).toHaveBeenCalledWith(
      "avatar_created_from_clip",
      {
        clip_id: "clip_1",
        count: 3,
        identity_mode: "similar",
        lighting: "any",
        style: "ugc",
      },
    );
  });

  it("shows loading, error, and poster fallback states without closing while generating", async () => {
    const onClose = vi.fn();
    const onCreate = vi.fn(async () => false);

    mocks.useObjectUrl.mockReturnValue(null);
    mocks.stateQueue = ["", "", "", 1, "same", "studio", "", "photo"];

    const tree = CreateAvatarFromClipDialog({
      clip: createClip({ mainPersonDescription: "", poseDescription: "" }),
      error: "Unable to create avatar",
      isGenerating: true,
      onClose,
      onCreate,
    });
    const root = findElements(
      tree,
      (element) =>
        element.type === "div" &&
        String(element.props?.className).includes(
          "dashboard-dialog-viewport",
        ),
    )[0];
    const submitButton = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "Button",
    )[0];

    expect(root.props.onClick).toBeUndefined();
    expect(submitButton.props.disabled).toBe(true);
    expect(submitButton.props.isLoading).toBe(true);

    mocks.stateQueue = ["", "", "", 1, "same", "studio", "", "photo"];
    const markup = renderToStaticMarkup(
      <CreateAvatarFromClipDialog
        clip={createClip({ mainPersonDescription: "", poseDescription: "" })}
        error="Unable to create avatar"
        isGenerating={true}
        onClose={onClose}
        onCreate={onCreate}
      />,
    );

    expect(markup).toContain("Poster loading");
    expect(markup).toContain("Unable to create avatar");
  });
});
