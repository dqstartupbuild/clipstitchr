import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssetTagEditor } from "@/app/_components/uploads/AssetTagEditor";

const mocks = vi.hoisted(() => ({
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

describe("AssetTagEditor", () => {
  beforeEach(() => {
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
  });

  it("adds parsed draft tags and clears the draft", () => {
    const onChange = vi.fn();

    mocks.stateQueue = ["New Tag, Demo"];

    const tree = AssetTagEditor({
      onChange,
      requiredTag: "ugc",
      tags: ["Demo"],
    });
    const [addButton] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "Button" &&
        element.props?.children === "Add",
    );

    (addButton.props.onClick as () => void)();

    expect(onChange).toHaveBeenCalledWith(["ugc", "demo", "new tag"]);
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith("");
  });

  it("ignores empty drafts and protects required tags from removal", () => {
    const onChange = vi.fn();

    mocks.stateQueue = ["   "];

    const tree = AssetTagEditor({
      onChange,
      requiredTag: "ugc",
      tags: ["ugc", "demo"],
    });
    const removeButtons = findElements(
      tree,
      (element) =>
        element.type === "button" &&
        typeof element.props?.["aria-label"] === "string" &&
        String(element.props["aria-label"]).startsWith("Remove"),
    );
    const [input] = findElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "text",
    );
    const [addButton] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "Button" &&
        element.props?.children === "Add",
    );

    expect(removeButtons).toHaveLength(1);

    (removeButtons[0].props.onClick as () => void)();
    (addButton.props.onClick as () => void)();
    (input.props.onKeyDown as (event: {
      key: string;
      preventDefault: () => void;
    }) => void)({
      key: "Tab",
      preventDefault: vi.fn(),
    });

    expect(onChange).toHaveBeenCalledWith(["ugc"]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
