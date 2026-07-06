import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductHookStyleSelect } from "@/app/_components/settings/ProductHookStyleSelect";
import { ProductSettingsCard } from "@/app/_components/settings/ProductSettingsCard";
import { ProductSettingsForm } from "@/app/_components/settings/ProductSettingsForm";
import { ProductSettingsList } from "@/app/_components/settings/ProductSettingsList";
import { SettingsAccountSection } from "@/app/_components/settings/SettingsAccountSection";
import { AutomationCliprModePicker } from "@/app/_components/settings/AutomationCliprModePicker";
import { SettingsAutomationPanel } from "@/app/_components/settings/SettingsAutomationPanel";
import { SettingsProductSection } from "@/app/_components/settings/SettingsProductSection";
import type { AutomationPreferencesInput } from "@/lib/clipstitchr/types/AutomationPreferencesInput";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  dispatchEvent: vi.fn(),
  localStorageGetItem: vi.fn(),
  mutation: vi.fn(),
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

vi.mock("convex/react", () => ({
  useMutation: () => mocks.mutation,
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

function createAutomationPreferences(
  overrides: Partial<AutomationPreferencesInput> = {},
): AutomationPreferencesInput {
  return {
    enabled: false,
    enabledTools: ["stitchr", "swapr", "clipr", "avatar-photo", "swipr"],
    cliprGenerationMode: "any",
    stitchrGenerationCount: 10,
    stitchrTextStyleChoice: "any",
    stitchrTextColorChoice: "any",
    stitchrTextBackgroundColorChoice: "any",
    stitchrTextStrokeColorChoice: "any",
    stitchrTemplateAllocations: [],
    swiprGenerationCount: 10,
    swiprSelectedLibraryPackNames: [],
    swiprTextStyleChoice: "any",
    swiprTextColorChoice: "any",
    swiprTextBackgroundColorChoice: "any",
    swiprTextStrokeColorChoice: "any",
    productSelectionMode: "all",
    selectedProductIds: [],
    avatarSelectionMode: "all",
    selectedAvatarIds: [],
    ...overrides,
  };
}

function createStitchTemplate(
  overrides: Partial<StitchTemplate> = {},
): StitchTemplate {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 12,
    height: 1920,
    id: "template_1",
    mode: "normal",
    name: "Winning hook",
    sourceStitchId: "stitch_1",
    sourceStitchName: "Source stitch",
    textOverlays: [],
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    updatedAt: "2026-05-20T00:00:00.000Z",
    width: 1080,
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
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders support, subscription, and product list states", () => {
    const emptyMarkup = renderToStaticMarkup(
      <>
        <SettingsProductSection
          activeProductId={undefined}
          activeProductName={undefined}
          automationError={null}
          automationPreferences={createAutomationPreferences()}
          defaultingProductId={null}
          deletingProductId={null}
          isAutomationLoading={false}
          isAutomationSaving={false}
          isProductActionDisabled={false}
          products={[]}
          savingProductId={null}
          stitchTemplates={[]}
          swiprPacks={[]}
          onDeleteProduct={async () => undefined}
          onSaveAutomation={async () => undefined}
          onSetActiveProduct={async () => undefined}
          onUpdateProduct={async () => undefined}
        />
        <SettingsAccountSection />
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

    expect(emptyMarkup).toContain("Daily drafts");
    expect(emptyMarkup).toContain("Clipr Config");
    expect(emptyMarkup).toContain("Stitchr Config");
    expect(emptyMarkup).toContain("Swipr Config");
    expect(emptyMarkup).toContain("Swipr");
    expect(emptyMarkup).toContain("Product settings");
    expect(emptyMarkup).toContain("Account settings");
    expect(emptyMarkup).toContain("Record product demos from your local app");
    expect(emptyMarkup).toContain("npm install -g clipstitchr");
    expect(emptyMarkup).toContain("Copy");
    expect(emptyMarkup).toContain('href="/docs/demo-cli"');
    expect(emptyMarkup).toContain('target="_blank"');
    expect(emptyMarkup).toContain("Contact support");
    expect(emptyMarkup).toContain("Coming soon");
    expect(emptyMarkup).toContain("Use the product switcher");
    expect(populatedMarkup).toContain("Launch Kit");
    expect(populatedMarkup).toContain("Active product");
  });

  it("shows Any in the Clipr automation mode picker", () => {
    const markup = renderToStaticMarkup(
      <AutomationCliprModePicker value="any" onChange={() => undefined} />,
    );

    expect(markup).toContain("Any");
    expect(markup).toContain("Reaction");
    expect(markup).toContain("B-roll");
    expect(markup).not.toContain("Script");
  });

  it("drafts automation setting changes without saving", () => {
    const onSave = vi.fn(async () => undefined);
    const preferences = createAutomationPreferences({
      enabledTools: ["stitchr"],
    });
    const tree = SettingsAutomationPanel({
      error: null,
      isLoading: false,
      isSaving: false,
      preferences,
      stitchTemplates: [createStitchTemplate()],
      swiprPacks: [],
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
    const [templatePicker] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "AutomationStitchrTemplateAllocationPicker",
    );

    (enableButton.props.onClick as () => void)();
    (stitchrCheckbox.props.onChange as () => void)();
    (stylePicker.props.onChange as (value: "hook") => void)("hook");
    (colorPickers[0].props.onChange as (value: "#fde047") => void)("#fde047");
    (templatePicker.props.onChange as (value: unknown) => void)([
      { templateId: "template_1", count: 2 },
    ]);

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
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(
      expect.objectContaining({
        preferences: expect.objectContaining({
          stitchrTemplateAllocations: [{ templateId: "template_1", count: 2 }],
        }),
      }),
    );
  });

  it("saves automation drafts from the Save button", async () => {
    const onSave = vi.fn(async () => undefined);
    const preferences = createAutomationPreferences({
      enabledTools: ["stitchr"],
    });

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
      stitchTemplates: [],
      swiprPacks: [],
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

  it("opens product details from the saved product card", () => {
    mocks.stateQueue = [false, true];

    const tree = ProductSettingsCard({
      isDefault: false,
      isDefaulting: false,
      isDeleting: false,
      isDisabled: false,
      isSaving: false,
      onDelete: vi.fn(),
      onSetDefault: vi.fn(),
      onUpdate: vi.fn(),
      product: createProduct({
        emotionalNarrative: "Founders want launch day to feel calm.",
      }),
    });
    const [detailsButton] = findElements(
      tree,
      (element) =>
        element.type === "button" &&
        element.props?.title === "Open Launch Kit details",
    );
    const [dialog] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "ProductSettingsDetailsDialog",
    );

    const openDetails = detailsButton.props.onClick as (event: {
      stopPropagation: () => void;
    }) => void;

    openDetails({ stopPropagation: vi.fn() });

    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(true);
    expect(dialog.props.product).toEqual(
      expect.objectContaining({
        emotionalNarrative: "Founders want launch day to feel calm.",
        id: "product_1",
      }),
    );
  });
});
