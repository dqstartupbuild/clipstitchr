import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductHookStyleSelect } from "@/app/_components/settings/ProductHookStyleSelect";
import { ProductSettingsCard } from "@/app/_components/settings/ProductSettingsCard";
import { ProductSettingsForm } from "@/app/_components/settings/ProductSettingsForm";
import { ProductSettingsList } from "@/app/_components/settings/ProductSettingsList";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsSupportPanel } from "@/app/_components/settings/SettingsSupportPanel";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
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

function createProduct(overrides: Partial<ProductProfile> = {}): ProductProfile {
  return {
    audienceDetails: "Founders",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "Launch faster",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("settings components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.confirm.mockReturnValue(true);
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    vi.stubGlobal("window", {
      confirm: mocks.confirm,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders support, subscription, and product list states", () => {
    const emptyMarkup = renderToStaticMarkup(
      <>
        <SettingsSupportPanel />
        <SettingsSubscriptionPanel />
        <ProductSettingsList
          products={[]}
          deletingProductId={null}
          isActionDisabled={false}
          savingProductId={null}
          onDelete={async () => undefined}
          onUpdate={async () => undefined}
        />
      </>,
    );
    const populatedMarkup = renderToStaticMarkup(
      <ProductSettingsList
        products={[createProduct()]}
        deletingProductId="product_1"
        isActionDisabled={true}
        savingProductId="product_1"
        onDelete={async () => undefined}
        onUpdate={async () => undefined}
      />,
    );

    expect(emptyMarkup).toContain("Contact support");
    expect(emptyMarkup).toContain("Coming soon");
    expect(emptyMarkup).toContain("Saved products will appear");
    expect(populatedMarkup).toContain("Launch Kit");
  });

  it("submits and resets the product settings form", async () => {
    const onCreate = vi.fn(async () => undefined);

    mocks.stateQueue = ["Launch Kit", "Benefits", "Creators", "problem"];

    const tree = ProductSettingsForm({
      isSaving: false,
      onCreate,
    });
    const [form] = findElements(tree, (element) => element.type === "form");
    const preventDefault = vi.fn();

    await (form.props.onSubmit as (event: {
      preventDefault: () => void;
    }) => Promise<void>)({ preventDefault });

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onCreate).toHaveBeenCalledWith({
      audienceDetails: "Creators",
      name: "Launch Kit",
      preferredCliprHookStyleKey: "problem",
      productDetails: "Benefits",
    });
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith("");
    expect(mocks.setStateCalls[3]).toHaveBeenCalledWith("");
  });

  it("ignores invalid form submissions and forwards hook style changes", async () => {
    const onCreate = vi.fn();

    mocks.stateQueue = ["   ", "", "", ""];

    const formTree = ProductSettingsForm({
      isSaving: false,
      onCreate,
    });
    const [form] = findElements(formTree, (element) => element.type === "form");
    const onHookStyleChange = vi.fn();
    const hookStyleTree = ProductHookStyleSelect({
      onChange: onHookStyleChange,
      value: "",
    });
    const [selectInput] = findElements(
      hookStyleTree,
      (element) =>
        typeof element.type === "function" && element.type.name === "SelectInput",
    );

    await (form.props.onSubmit as (event: {
      preventDefault: () => void;
    }) => Promise<void>)({ preventDefault: vi.fn() });
    (selectInput.props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "identity" } });

    expect(onCreate).not.toHaveBeenCalled();
    expect(onHookStyleChange).toHaveBeenCalledWith("identity");
  });

  it("opens edit state and confirms product deletion", async () => {
    const onDelete = vi.fn(async () => undefined);
    const onUpdate = vi.fn(async () => undefined);

    mocks.stateQueue = [true];

    const tree = ProductSettingsCard({
      isDeleting: false,
      isDisabled: false,
      isSaving: false,
      onDelete,
      onUpdate,
      product: createProduct({ preferredCliprHookStyleKey: "problem" }),
    });
    const iconButtons = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "IconButton",
    );
    const [dialog] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "ProductSettingsEditDialog",
    );

    (iconButtons[0].props.onClick as () => void)();
    (iconButtons[1].props.onClick as () => void)();
    await Promise.resolve();
    await (dialog.props.onSave as (input: {
      name: string;
      productDetails: string;
      audienceDetails: string;
    }) => Promise<void>)({
      audienceDetails: "Teams",
      name: "Updated",
      productDetails: "Details",
    });

    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);
    expect(mocks.confirm).toHaveBeenCalledWith(expect.stringContaining("Launch Kit"));
    expect(onDelete).toHaveBeenCalledWith("product_1");
    expect(onUpdate).toHaveBeenCalledWith("product_1", {
      audienceDetails: "Teams",
      name: "Updated",
      productDetails: "Details",
    });
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(false);
  });
});
