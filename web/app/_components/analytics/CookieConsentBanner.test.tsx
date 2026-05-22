import { describe, expect, it, vi } from "vitest";
import { CookieConsentBanner } from "@/app/_components/analytics/CookieConsentBanner";

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

describe("CookieConsentBanner", () => {
  it("renders cookie choices and calls the selected handler", () => {
    const onAcceptAll = vi.fn();
    const onEssentialsOnly = vi.fn();
    const tree = CookieConsentBanner({
      onAcceptAll,
      onEssentialsOnly,
    });
    const buttons = findElements(tree, (element) => element.type === "button");

    expect(buttons).toHaveLength(2);

    (buttons[0].props.onClick as () => void)();
    (buttons[1].props.onClick as () => void)();

    expect(onAcceptAll).toHaveBeenCalledOnce();
    expect(onEssentialsOnly).toHaveBeenCalledOnce();
  });
});
