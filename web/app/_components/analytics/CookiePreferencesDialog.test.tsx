import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookiePreferencesDialog } from "@/app/_components/analytics/CookiePreferencesDialog";

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

describe("CookiePreferencesDialog", () => {
  beforeEach(() => {
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
  });

  it("renders toggles and routes actions to preference handlers", () => {
    const onAcceptAll = vi.fn();
    const onCancel = vi.fn();
    const onEssentialsOnly = vi.fn();
    const onSave = vi.fn();

    mocks.stateQueue = [false, true];

    const tree = CookiePreferencesDialog({
      initialAnalytics: true,
      initialMarketing: false,
      onAcceptAll,
      onCancel,
      onEssentialsOnly,
      onSave,
    });
    const checkboxes = findElements(
      tree,
      (element) => element.type === "input" && element.props?.type === "checkbox",
    );
    const buttons = findElements(tree, (element) => element.type === "button");

    expect(checkboxes).toHaveLength(3);

    (checkboxes[1].props.onChange as (event: {
      currentTarget: { checked: boolean };
    }) => void)({ currentTarget: { checked: true } });
    (checkboxes[2].props.onChange as (event: {
      currentTarget: { checked: boolean };
    }) => void)({ currentTarget: { checked: false } });
    (buttons[0].props.onClick as () => void)();
    (buttons[1].props.onClick as () => void)();
    (buttons[2].props.onClick as () => void)();
    (buttons[3].props.onClick as () => void)();

    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);
    expect(mocks.setStateCalls[1]).toHaveBeenCalledWith(false);
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onAcceptAll).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith({
      analytics: false,
      marketing: true,
    });
    expect(onEssentialsOnly).toHaveBeenCalledOnce();
  });
});
