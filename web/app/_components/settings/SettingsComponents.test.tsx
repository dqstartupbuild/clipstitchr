import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductHookStyleSelect } from "@/app/_components/settings/ProductHookStyleSelect";
import { ProductSettingsCard } from "@/app/_components/settings/ProductSettingsCard";
import { ProductSettingsForm } from "@/app/_components/settings/ProductSettingsForm";
import { ProductSettingsList } from "@/app/_components/settings/ProductSettingsList";
import { SettingsAppearancePanel } from "@/app/_components/settings/SettingsAppearancePanel";
import { SettingsAutomationPanel } from "@/app/_components/settings/SettingsAutomationPanel";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsSupportPanel } from "@/app/_components/settings/SettingsSupportPanel";
import { ThemeModeSelect } from "@/app/_components/settings/ThemeModeSelect";
import { themeModeChangeEventName } from "@/lib/clipstitchr/theme/themeModeChangeEventName";
import { themeModeStorageKey } from "@/lib/clipstitchr/theme/themeModeStorageKey";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  dispatchEvent: vi.fn(),
  localStorageGetItem: vi.fn(),
  localStorageRemoveItem: vi.fn(),
  localStorageSetItem: vi.fn(),
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: () => undefined,
    useMemo: (callback: () => unknown) => callback(),
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
    useSyncExternalStore: (
      _subscribe: () => () => void,
      _getSnapshot: () => unknown,
      getServerSnapshot: () => unknown,
    ) => getServerSnapshot(),
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
    mocks.localStorageGetItem.mockReturnValue(null);
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    vi.stubGlobal("window", {
      confirm: mocks.confirm,
      dispatchEvent: mocks.dispatchEvent,
      localStorage: {
        getItem: mocks.localStorageGetItem,
        removeItem: mocks.localStorageRemoveItem,
        setItem: mocks.localStorageSetItem,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders support, subscription, and product list states", () => {
    const emptyMarkup = renderToStaticMarkup(
      <>
        <SettingsAppearancePanel />
        <SettingsAutomationPanel
          error={null}
          isLoading={false}
          isSaving={false}
          preferences={{
            enabled: false,
            enabledTools: ["stitchr", "swapr", "clipr", "avatar-photo", "swipr"],
            cliprGenerationMode: "any",
            stitchrTextStyleChoice: "any",
            stitchrTextColorChoice: "any",
            stitchrTextBackgroundColorChoice: "any",
            productSelectionMode: "all",
            selectedProductIds: [],
            avatarSelectionMode: "all",
            selectedAvatarIds: [],
          }}
          onSave={async () => undefined}
        />
        <SettingsSupportPanel />
        <SettingsSubscriptionPanel />
        <ProductSettingsList
          products={[]}
          defaultProductId={undefined}
          defaultingProductId={null}
          deletingProductId={null}
          isActionDisabled={false}
          savingProductId={null}
          onDelete={async () => undefined}
          onSetDefault={async () => undefined}
          onUpdate={async () => undefined}
        />
      </>,
    );
    const populatedMarkup = renderToStaticMarkup(
      <ProductSettingsList
        products={[createProduct()]}
        defaultProductId="product_1"
        defaultingProductId={null}
        deletingProductId="product_1"
        isActionDisabled={true}
        savingProductId="product_1"
        onDelete={async () => undefined}
        onSetDefault={async () => undefined}
        onUpdate={async () => undefined}
      />,
    );

    expect(emptyMarkup).toContain("Color mode");
    expect(emptyMarkup).toContain("Daily drafts");
    expect(emptyMarkup).toContain("Text color");
    expect(emptyMarkup).toContain("Background color");
    expect(emptyMarkup).toContain("Swipr");
    expect(emptyMarkup).toContain("Contact support");
    expect(emptyMarkup).toContain("Coming soon");
    expect(emptyMarkup).toContain("Saved products will appear");
    expect(populatedMarkup).toContain("Launch Kit");
    expect(populatedMarkup).toContain("Default product");
  });

  it("drafts automation setting changes without saving", () => {
    const onSave = vi.fn(async () => undefined);
    const preferences: AutomationPreferencesInput = {
      enabled: false,
      enabledTools: ["stitchr"],
      cliprGenerationMode: "any",
      stitchrTextStyleChoice: "any",
      stitchrTextColorChoice: "any",
      stitchrTextBackgroundColorChoice: "any",
      productSelectionMode: "all",
      selectedProductIds: [],
      avatarSelectionMode: "all",
      selectedAvatarIds: [],
    };
    const tree = SettingsAutomationPanel({
      error: null,
      isLoading: false,
      isSaving: false,
      preferences,
      onSave,
    });
    const [enableButton] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "Button",
    );
    const [stitchrCheckbox] = findElements(
      tree,
      (element) =>
        element.type === "input" && element.props?.checked === true,
    );
    const [stylePicker] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "AutomationStitchrTextStylePicker",
    );
    const colorPickers = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "AutomationStitchrColorChoicePicker",
    );

    (enableButton.props.onClick as () => void)();
    (stitchrCheckbox.props.onChange as () => void)();
    (stylePicker.props.onChange as (value: "hook") => void)("hook");
    (colorPickers[0].props.onChange as (value: "#fde047") => void)("#fde047");

    expect(onSave).not.toHaveBeenCalled();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(
      expect.objectContaining({
        preferences: expect.objectContaining({ enabled: true }),
      }),
    );
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(
      expect.objectContaining({
        preferences: expect.objectContaining({ enabledTools: [] }),
      }),
    );
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(
      expect.objectContaining({
        preferences: expect.objectContaining({ stitchrTextStyleChoice: "hook" }),
      }),
    );
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(
      expect.objectContaining({
        preferences: expect.objectContaining({
          stitchrTextColorChoice: "#fde047",
        }),
      }),
    );
  });

  it("saves automation drafts from the Save button", async () => {
    const onSave = vi.fn(async () => undefined);
    const preferences: AutomationPreferencesInput = {
      enabled: false,
      enabledTools: ["stitchr"],
      cliprGenerationMode: "any",
      stitchrTextStyleChoice: "any",
      stitchrTextColorChoice: "any",
      stitchrTextBackgroundColorChoice: "any",
      productSelectionMode: "all",
      selectedProductIds: [],
      avatarSelectionMode: "all",
      selectedAvatarIds: [],
    };

    mocks.stateQueue = [
      {
        preferences: { ...preferences, enabled: true },
        preferencesKey: JSON.stringify(preferences),
      },
    ];

    const tree = SettingsAutomationPanel({
      error: null,
      isLoading: false,
      isSaving: false,
      preferences,
      onSave,
    });
    const [saveButton] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "Button" &&
        element.props?.children === "Save",
    );

    await (saveButton.props.onClick as () => Promise<void>)();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });

  it("forwards theme selector changes", () => {
    const selectTree = ThemeModeSelect();
    const [selectInput] = findElements(
      selectTree,
      (element) =>
        typeof element.type === "function" && element.type.name === "SelectInput",
    );

    (selectInput.props.onChange as (event: {
      currentTarget: { value: string };
    }) => void)({ currentTarget: { value: "dark" } });

    expect(mocks.localStorageSetItem).toHaveBeenCalledWith(
      themeModeStorageKey,
      "dark",
    );
    expect(mocks.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: themeModeChangeEventName }),
    );
  });

  it("submits and resets the product settings form", async () => {
    const onCreate = vi.fn(async () => undefined);

    mocks.stateQueue = [
      "Launch Kit",
      "https://launchkit.example.com/",
      "Benefits",
      "Creators",
      "Creators want to feel proud of launching.",
      "problem",
    ];

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
      emotionalNarrative: "Creators want to feel proud of launching.",
      name: "Launch Kit",
      preferredCliprHookStyleKey: "problem",
      productDetails: "Benefits",
      websiteUrl: "https://launchkit.example.com/",
    });
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith("");
    expect(mocks.setStateCalls[4]).toHaveBeenCalledWith("");
    expect(mocks.setStateCalls[5]).toHaveBeenCalledWith("");
  });

  it("ignores invalid form submissions and forwards hook style changes", async () => {
    const onCreate = vi.fn();

    mocks.stateQueue = ["   ", "", "", "", "", ""];

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
    const onSetDefault = vi.fn(async () => undefined);
    const onUpdate = vi.fn(async () => undefined);

    mocks.stateQueue = [true];

    const tree = ProductSettingsCard({
      isDefault: false,
      isDefaulting: false,
      isDeleting: false,
      isDisabled: false,
      isSaving: false,
      onDelete,
      onSetDefault,
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
    (iconButtons[2].props.onClick as () => void)();
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
    expect(onSetDefault).toHaveBeenCalledWith(
      expect.objectContaining({ id: "product_1" }),
    );
    expect(onDelete).toHaveBeenCalledWith("product_1");
    expect(onUpdate).toHaveBeenCalledWith("product_1", {
      audienceDetails: "Teams",
      name: "Updated",
      productDetails: "Details",
    });
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(false);
  });
});
