import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SwiprBackgroundPanel } from "@/app/_components/swipr/SwiprBackgroundPanel";

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

const mocks = vi.hoisted(() => ({
  buttons: [] as Array<{
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
  }>,
}));

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
  }) => {
    mocks.buttons.push({ disabled, isLoading, onClick });

    return (
      <button disabled={disabled} data-loading={isLoading} onClick={onClick}>
        {children}
      </button>
    );
  },
}));

describe("SwiprBackgroundPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buttons = [];
  });

  it("renders the slide photo controls and wires prompt, AI, and upload actions", () => {
    const onGenerateAiBackground = vi.fn();
    const onGenerationPromptChange = vi.fn();
    const onUploadBackground = vi.fn();
    const tree = SwiprBackgroundPanel({
      activeSlideIndex: 1,
      generationPrompt: "warm studio",
      isAiDisabled: false,
      isGeneratingAi: false,
      isSaving: false,
      onGenerateAiBackground,
      onGenerationPromptChange,
      onUploadBackground,
    });
    const markup = renderToStaticMarkup(tree);
    const [promptInput] = findElements(
      tree,
      (element) => element.type === "textarea",
    );
    const [fileInput] = findElements(
      tree,
      (element) => element.type === "input",
    );
    const target = {
      files: [new File(["photo"], "photo.jpg", { type: "image/jpeg" })],
      value: "photo.jpg",
    };

    expect(markup).toContain("Slide photos");
    expect(markup).toContain("Generate slide 2");

    (promptInput.props.onChange as (event: {
      target: { value: string };
    }) => void)({
      target: { value: "brighter counter" },
    });
    (fileInput.props.onChange as (event: { target: typeof target }) => void)({
      target,
    });
    mocks.buttons[0]?.onClick?.();

    expect(onGenerationPromptChange).toHaveBeenCalledWith("brighter counter");
    expect(onUploadBackground).toHaveBeenCalledWith(target.files);
    expect(target.value).toBe("");
    expect(onGenerateAiBackground).toHaveBeenCalled();
  });

  it("disables photo creation while busy", () => {
    const tree = SwiprBackgroundPanel({
      activeSlideIndex: 0,
      generationPrompt: "",
      isAiDisabled: true,
      isGeneratingAi: true,
      isSaving: true,
      onGenerateAiBackground: vi.fn(),
      onGenerationPromptChange: vi.fn(),
      onUploadBackground: vi.fn(),
    });
    const [fileInput] = findElements(
      tree,
      (element) => element.type === "input",
    );

    renderToStaticMarkup(tree);

    expect(mocks.buttons[0]).toMatchObject({
      disabled: true,
      isLoading: true,
    });
    expect(fileInput.props.disabled).toBe(true);
  });
});
