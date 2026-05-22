import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ElementLike = {
  props?: Record<string, unknown>;
  type?: unknown;
};

type ChangeHandler = (event: { currentTarget: { value: string } }) => void;
type DialogProps = Parameters<
  typeof import("@/app/_components/uploads/AssetMetadataEditDialog").AssetMetadataEditDialog
>[0];

const mocks = vi.hoisted(() => ({
  cleanup: undefined as (() => void) | undefined,
  stateSetter: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      const cleanup = effect();

      if (typeof cleanup === "function") {
        mocks.cleanup = cleanup;
      }
    },
    useRef: (value: unknown) => ({ current: value }),
    useState: (initialValue: unknown) => {
      const value =
        typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;

      return [value, mocks.stateSetter];
    },
  };
});

function createProduct(): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch kit",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

function isElementLike(value: unknown): value is ElementLike {
  return Boolean(
    value &&
      typeof value === "object" &&
      "props" in value &&
      "type" in value,
  );
}

function collectElements(element: unknown): ElementLike[] {
  if (Array.isArray(element)) {
    return element.flatMap(collectElements);
  }

  if (!isElementLike(element)) {
    return [];
  }

  const children = element.props?.children;

  return [element, ...collectElements(children)];
}

function getSubmitHandler(element: unknown) {
  const form = collectElements(element).find((child) => child.type === "form");

  if (!form?.props?.onSubmit) {
    throw new Error("Missing form submit handler.");
  }

  return form.props.onSubmit as (event: { preventDefault: () => void }) => void;
}

async function renderDialog(
  props: Partial<DialogProps> = {},
) {
  const { AssetMetadataEditDialog: Dialog } = await import(
    "@/app/_components/uploads/AssetMetadataEditDialog"
  );

  return Dialog({
    initialName: " UGC clip ",
    onClose: vi.fn(),
    onSave: vi.fn(),
    title: "Edit clip",
    ...props,
  });
}

describe("AssetMetadataEditDialog interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanup = undefined;
  });

  it("submits trimmed metadata with every optional field enabled", async () => {
    const onSave = vi.fn();
    const element = await renderDialog({
      descriptionLabel: "Avatar description",
      initialDescription: " Avatar notes ",
      initialLocationDescription: " Studio ",
      initialMainPersonDescription: " Creator ",
      initialOutfitDescription: " Blue jacket ",
      initialPoseDescription: " Pointing ",
      initialProductDescription: " Product demo ",
      initialProductId: "product_1",
      initialTags: ["ugc", "Demo"],
      initialVideoDescription: " Talking head ",
      onSave,
      products: [createProduct()],
      requiredTag: "ugc",
      showMainPersonDescriptionFields: true,
      showPhotoDescriptionFields: true,
      showProductDescriptionField: true,
      showVideoDescriptionFields: true,
    });

    const elements = collectElements(element);
    for (const child of elements.filter((child) => child.type === "input")) {
      (child.props?.onChange as ChangeHandler | undefined)?.({
        currentTarget: { value: "Changed title" },
      });
    }
    for (const child of elements.filter((child) => child.type === "textarea")) {
      (child.props?.onChange as ChangeHandler | undefined)?.({
        currentTarget: { value: "Changed text" },
      });
    }
    const select = elements.find((child) => child.props?.label === "Product");
    (select?.props?.onChange as ChangeHandler | undefined)?.({
      currentTarget: { value: "product_1" },
    });
    const tagEditor = elements.find((child) => Array.isArray(child.props?.tags));
    (tagEditor?.props?.onChange as ((tags: string[]) => void) | undefined)?.([
      "ugc",
      "fresh",
    ]);

    getSubmitHandler(element)({ preventDefault: vi.fn() });
    await Promise.resolve();

    expect(onSave).toHaveBeenCalledWith({
      avatarDescription: "Avatar notes",
      locationDescription: "Studio",
      mainPersonDescription: "Creator",
      name: "UGC clip",
      outfitDescription: "Blue jacket",
      poseDescription: "Pointing",
      productDescription: "Product demo",
      productId: "product_1",
      tags: ["ugc", "demo"],
      videoDescription: "Talking head",
    });
    expect(mocks.stateSetter).toHaveBeenCalledWith(true);
    expect(mocks.stateSetter).toHaveBeenCalledWith(false);
  });

  it("submits minimal metadata without optional descriptions", async () => {
    const onSave = vi.fn();
    const element = await renderDialog({
      initialTags: [" demo ", "fresh"],
      onSave,
    });

    getSubmitHandler(element)({ preventDefault: vi.fn() });
    await Promise.resolve();

    expect(onSave).toHaveBeenCalledWith({
      name: "UGC clip",
      tags: ["demo", "fresh"],
    });
  });

  it("does not save when a required product selection is missing", async () => {
    const onSave = vi.fn();
    const element = await renderDialog({
      initialProductId: "missing_product",
      onSave,
      products: [createProduct()],
      showProductDescriptionField: true,
      showVideoDescriptionFields: true,
    });

    getSubmitHandler(element)({ preventDefault: vi.fn() });
    await Promise.resolve();

    expect(onSave).not.toHaveBeenCalled();
  });

  it("skips saving-state cleanup after unmount", async () => {
    let resolveSave: (() => void) | undefined;
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const element = await renderDialog({ onSave });

    getSubmitHandler(element)({ preventDefault: vi.fn() });
    mocks.cleanup?.();
    resolveSave?.();
    await Promise.resolve();

    expect(onSave).toHaveBeenCalled();
    expect(mocks.stateSetter).toHaveBeenCalledWith(true);
    expect(mocks.stateSetter).not.toHaveBeenCalledWith(false);
  });
});
