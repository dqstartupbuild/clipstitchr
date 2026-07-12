import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductSettingsEditDialog } from "@/app/_components/settings/ProductSettingsEditDialog";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  buttons: [] as Array<{
    children: React.ReactNode;
    disabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
  }>,
  hookSelectProps: null as {
    onChange: (value: string) => void;
    value: string;
  } | null,
  setState: vi.fn(),
  stateQueue: [] as unknown[],
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

vi.mock("@/app/_components/settings/ProductHookStyleSelect", () => ({
  ProductHookStyleSelect: (props: NonNullable<typeof mocks.hookSelectProps>) => {
    mocks.hookSelectProps = props;
    return `ProductHookStyleSelect:${props.value}`;
  },
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
    mocks.buttons.push({ children, disabled, isLoading, onClick });
    return (
      <button disabled={disabled || isLoading} type="button">
        {children}
      </button>
    );
  },
}));

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    emotionalNarrative: "Founders want to stop feeling scattered.",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    preferredCliprHookStyleKey: "mystery_gap",
    productDetails: "A launch kit",
    rejectedHookExamples: ["Too hype"],
    hookEdgeLevel: "punchy",
    hookGenerationGoal: "views",
    updatedAt: "2026-05-20T00:00:00.000Z",
    websiteUrl: "https://launchkit.example.com/",
    winningHookExamples: ["Real winner"],
    ...overrides,
  };
}

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

describe("ProductSettingsEditDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buttons = [];
    mocks.hookSelectProps = null;
    mocks.setState.mockReset();
    mocks.stateQueue = [];
  });

  it("renders editable product context fields", () => {
    const markup = renderToStaticMarkup(
      <ProductSettingsEditDialog
        product={createProduct()}
        isSaving={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(markup).toContain("Edit product context");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("ProductHookStyleSelect:mystery_gap");
    expect(markup).toContain("Website URL");
    expect(markup).toContain("Product details");
    expect(markup).toContain("Audience details");
    expect(markup).toContain("Emotional narrative");
    expect(markup).toContain("Save");
    expect(markup).not.toContain("Hooks to learn from");
    expect(markup).not.toContain("Real winner");
  });

  it("updates form fields and submits the current product settings", async () => {
    mocks.stateQueue = [
      "New Launch Kit",
      "https://new.example.com/",
      "New product details",
      "New audience",
      "New emotional story",
      "direct",
    ];
    const onClose = vi.fn();
    const onSave = vi.fn(async (input: ProductProfileCreateInput) => {
      void input;
      return "ok";
    });
    const tree = ProductSettingsEditDialog({
      isSaving: false,
      onClose,
      onSave,
      product: createProduct(),
    });
    renderToStaticMarkup(tree);
    const [form] = findElements(tree, (element) => element.type === "form");
    const [closeButton] = findElements(
      tree,
      (element) => element.type === "button",
    );
    const [nameInput, websiteInput] = findElements(
      tree,
      (element) => element.type === "input",
    );
    const textareas = findElements(tree, (element) => element.type === "textarea");
    const preventDefault = vi.fn();

    (nameInput.props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "Typed name" } });
    (websiteInput.props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "https://typed.example.com/" } });
    (textareas[0].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "Typed details" } });
    (textareas[1].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "Typed audience" } });
    (textareas[2].props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "Typed emotional story" } });
    mocks.hookSelectProps?.onChange("mystery_gap");
    (closeButton.props.onClick as () => void)();
    mocks.buttons[0]?.onClick?.();
    await (form.props.onSubmit as (event: {
      preventDefault: () => void;
    }) => Promise<void>)({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    expect(mocks.setState).toHaveBeenCalledWith("Typed name");
    expect(mocks.setState).toHaveBeenCalledWith("https://typed.example.com/");
    expect(mocks.setState).toHaveBeenCalledWith("Typed details");
    expect(mocks.setState).toHaveBeenCalledWith("Typed audience");
    expect(mocks.setState).toHaveBeenCalledWith("Typed emotional story");
    expect(mocks.setState).toHaveBeenCalledWith("mystery_gap");
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenCalledWith({
      audienceDetails: "New audience",
      emotionalNarrative: "New emotional story",
      hookEdgeLevel: "punchy",
      hookGenerationGoal: "views",
      name: "New Launch Kit",
      preferredCliprHookStyleKey: "direct",
      productDetails: "New product details",
      rejectedHookExamples: ["Too hype"],
      websiteUrl: "https://new.example.com/",
      winningHookExamples: ["Real winner"],
    });
  });

  it("does not submit while disabled and swallows save failures", async () => {
    mocks.stateQueue = ["   ", "", "Details", "Audience", "", ""];
    const disabledSave = vi.fn(async () => undefined);
    const disabledTree = ProductSettingsEditDialog({
      isSaving: false,
      onClose: vi.fn(),
      onSave: disabledSave,
      product: createProduct(),
    });
    renderToStaticMarkup(disabledTree);
    const [disabledForm] = findElements(
      disabledTree,
      (element) => element.type === "form",
    );

    await (disabledForm.props.onSubmit as (event: {
      preventDefault: () => void;
    }) => Promise<void>)({ preventDefault: vi.fn() });

    expect(disabledSave).not.toHaveBeenCalled();
    expect(mocks.buttons[1]?.disabled).toBe(true);

    mocks.buttons = [];
    mocks.stateQueue = ["Launch Kit", "", "Details", "Audience", "", ""];
    const failingSave = vi.fn(async () => {
      throw new Error("save failed");
    });
    const failingTree = ProductSettingsEditDialog({
      isSaving: true,
      onClose: vi.fn(),
      onSave: failingSave,
      product: createProduct(),
    });
    renderToStaticMarkup(failingTree);
    const [failingForm] = findElements(
      failingTree,
      (element) => element.type === "form",
    );

    await (failingForm.props.onSubmit as (event: {
      preventDefault: () => void;
    }) => Promise<void>)({ preventDefault: vi.fn() });

    expect(failingSave).not.toHaveBeenCalled();
    expect(mocks.buttons[1]?.isLoading).toBe(true);

    mocks.buttons = [];
    mocks.stateQueue = ["Launch Kit", "", "Details", "Audience", "", ""];
    const rejectedSave = vi.fn(async () => {
      throw new Error("save failed");
    });
    const rejectedTree = ProductSettingsEditDialog({
      isSaving: false,
      onClose: vi.fn(),
      onSave: rejectedSave,
      product: createProduct({
        preferredCliprHookStyleKey: undefined,
      }),
    });
    renderToStaticMarkup(rejectedTree);
    const [rejectedForm] = findElements(
      rejectedTree,
      (element) => element.type === "form",
    );

    await expect(
      (rejectedForm.props.onSubmit as (event: {
        preventDefault: () => void;
      }) => Promise<void>)({ preventDefault: vi.fn() }),
    ).resolves.toBeUndefined();

    expect(rejectedSave).toHaveBeenCalledWith({
      audienceDetails: "Audience",
      hookEdgeLevel: "punchy",
      hookGenerationGoal: "views",
      name: "Launch Kit",
      preferredCliprHookStyleKey: undefined,
      productDetails: "Details",
      rejectedHookExamples: ["Too hype"],
      winningHookExamples: ["Real winner"],
    });
  });
});
