import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SwiprBackgroundPanel } from "@/app/_components/swipr/SwiprBackgroundPanel";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

const mocks = vi.hoisted(() => ({
  backgroundCardProps: [] as Array<{
    background: SwiprBackgroundAsset;
    isSelected: boolean;
    onSelect: (background: SwiprBackgroundAsset) => void;
  }>,
  cleanupFns: [] as Array<() => void>,
  paginationControlsProps: null as null | {
    onNext: () => void;
    onPrevious: () => void;
  },
  paginationValue: null as null | {
    canGoNext: boolean;
    canGoPrevious: boolean;
    currentPage: number;
    endIndex: number;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    pageItems: SwiprBackgroundAsset[];
    totalItems: number;
    totalPages: number;
    visibleEnd: number;
    visibleStart: number;
  },
  searchProps: null as null | {
    onChange: (query: string) => void;
    value: string;
  },
  useEffect: vi.fn(),
  usePagination: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
  };
});

vi.mock("@/app/_components/ui/Button", () => ({
  Button: ({
    children,
    disabled,
    isLoading,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} data-loading={isLoading} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/app/_components/ui/PaginationControls", () => ({
  PaginationControls: (props: typeof mocks.paginationControlsProps) => {
    mocks.paginationControlsProps = props;
    return "PaginationControls";
  },
}));

vi.mock("@/app/_components/ui/SearchInput", () => ({
  SearchInput: (props: typeof mocks.searchProps) => {
    mocks.searchProps = props;
    return "SearchInput";
  },
}));

vi.mock("@/app/_components/swipr/SwiprBackgroundLibraryCard", () => ({
  SwiprBackgroundLibraryCard: (props: {
    background: SwiprBackgroundAsset;
    isSelected: boolean;
    onSelect: (background: SwiprBackgroundAsset) => void;
  }) => {
    mocks.backgroundCardProps.push(props);
    return "SwiprBackgroundLibraryCard";
  },
}));

vi.mock("@/lib/clipstitchr/hooks/usePagination", () => ({
  usePagination: mocks.usePagination,
}));

function createBackground(
  overrides: Partial<SwiprBackgroundAsset> = {},
): SwiprBackgroundAsset {
  return {
    imageObject: {
      contentType: "image/jpeg",
      key: "background.jpg",
      size: 10,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1920,
    id: "background_1",
    mimeType: "image/jpeg",
    name: "Background",
    size: 10,
    source: "upload",
    tags: ["background"],
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

describe("SwiprBackgroundPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.backgroundCardProps = [];
    mocks.cleanupFns = [];
    mocks.paginationControlsProps = null;
    mocks.searchProps = null;
    mocks.paginationValue = {
      canGoNext: true,
      canGoPrevious: false,
      currentPage: 1,
      endIndex: 2,
      goToNextPage: vi.fn(),
      goToPreviousPage: vi.fn(),
      pageItems: [],
      totalItems: 3,
      totalPages: 2,
      visibleEnd: 2,
      visibleStart: 1,
    };
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      const cleanup = effect();

      if (typeof cleanup === "function") {
        mocks.cleanupFns.push(cleanup);
      }
    });
    mocks.usePagination.mockImplementation(() => mocks.paginationValue);
  });

  it("preloads visible and next-page backgrounds and wires controls", async () => {
    const first = createBackground();
    const loaded = createBackground({
      blob: new Blob(["background"]),
      id: "background_2",
    });
    const next = createBackground({ id: "background_3" });
    const onBackgroundSearchChange = vi.fn();
    const onGenerationPromptChange = vi.fn();
    const onGenerateAiBackground = vi.fn();
    const onLoadBackgroundBlob = vi.fn(async () => new Blob(["loaded"]));
    const onSeedBackgroundLibrary = vi.fn();
    const onSelectBackground = vi.fn();
    const onUploadBackground = vi.fn();

    mocks.paginationValue = {
      ...mocks.paginationValue!,
      pageItems: [first, loaded],
    };

    const tree = SwiprBackgroundPanel({
      background: {
        blob: new Blob(["selected"], { type: "image/jpeg" }),
        id: first.id,
        name: first.name,
        source: first.source,
      },
      backgroundSearchQuery: "studio",
      backgrounds: [first, loaded, next],
      generationPrompt: "warm studio",
      isAiDisabled: false,
      isGeneratingAi: false,
      isSaving: false,
      slideCount: 3,
      onBackgroundSearchChange,
      onGenerationPromptChange,
      onGenerateAiBackground,
      onLoadBackgroundBlob,
      onSeedBackgroundLibrary,
      onSelectBackground,
      onUploadBackground,
    });
    const markup = renderToStaticMarkup(tree);

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(markup).toContain("PaginationControls");
    expect(onLoadBackgroundBlob).toHaveBeenCalledWith("background_1");
    expect(onLoadBackgroundBlob).toHaveBeenCalledWith("background_3");
    expect(onLoadBackgroundBlob).not.toHaveBeenCalledWith("background_2");
    expect(mocks.backgroundCardProps[0]).toEqual(
      expect.objectContaining({
        background: first,
        isSelected: true,
      }),
    );

    mocks.searchProps?.onChange("new query");
    mocks.backgroundCardProps[0].onSelect(first);
    mocks.paginationControlsProps?.onNext();

    const clickableControls = findElements(
      tree,
      (element) => typeof element.props?.onClick === "function",
    );
    for (const control of clickableControls) {
      (control.props.onClick as (() => void) | undefined)?.();
    }

    const [fileInput] = findElements(
      tree,
      (element) => element.type === "input",
    );
    const [promptInput] = findElements(
      tree,
      (element) => element.type === "textarea",
    );
    (promptInput.props.onChange as (event: {
      target: { value: string };
    }) => void)({
      target: { value: "brighter counter" },
    });
    const target = {
      files: [
        new File(["bg"], "background.jpg", { type: "image/jpeg" }),
        new File(["bg2"], "background-2.jpg", { type: "image/jpeg" }),
      ],
      value: "background.jpg",
    };
    (fileInput.props.onChange as (event: { target: typeof target }) => void)({
      target,
    });
    (fileInput.props.onChange as (event: { target: typeof target }) => void)({
      target: { files: [], value: "empty" },
    });

    expect(onBackgroundSearchChange).toHaveBeenCalledWith("new query");
    expect(onGenerationPromptChange).toHaveBeenCalledWith("brighter counter");
    expect(onSelectBackground).toHaveBeenCalledWith(first);
    expect(mocks.paginationValue?.goToNextPage).toHaveBeenCalled();
    expect(onGenerateAiBackground).toHaveBeenCalled();
    expect(onSeedBackgroundLibrary).toHaveBeenCalled();
    expect(onUploadBackground).toHaveBeenCalledWith(target.files);
    expect(target.value).toBe("");
  });

  it("cancels queued preload work and renders an empty busy state", async () => {
    const onLoadBackgroundBlob = vi.fn(async () => new Blob(["loaded"]));

    mocks.paginationValue = {
      ...mocks.paginationValue!,
      pageItems: [createBackground()],
      totalItems: 0,
      totalPages: 1,
    };

    const tree = SwiprBackgroundPanel({
      background: null,
      backgroundSearchQuery: "",
      backgrounds: [],
      generationPrompt: "",
      isAiDisabled: true,
      isGeneratingAi: true,
      isSaving: true,
      slideCount: 3,
      onBackgroundSearchChange: vi.fn(),
      onGenerationPromptChange: vi.fn(),
      onGenerateAiBackground: vi.fn(),
      onLoadBackgroundBlob,
      onSelectBackground: vi.fn(),
      onUploadBackground: vi.fn(),
    });
    const markup = renderToStaticMarkup(tree);

    mocks.cleanupFns[0]();
    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }

    expect(markup).toContain("No backgrounds yet");
    expect(onLoadBackgroundBlob).not.toHaveBeenCalled();

    const [fileInput] = findElements(
      tree,
      (element) => element.type === "input",
    );

    expect(fileInput.props.disabled).toBe(true);
  });
});
