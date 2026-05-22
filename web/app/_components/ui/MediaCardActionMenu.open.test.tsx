import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaCardActionMenu } from "@/app/_components/ui/MediaCardActionMenu";

const mocks = vi.hoisted(() => ({
  cleanupFns: [] as Array<() => void>,
  eventHandlers: new Map<string, EventListenerOrEventListenerObject>(),
  refQueue: [] as Array<{ current: unknown }>,
  setState: vi.fn((value: unknown) =>
    typeof value === "function" ? (value as (open: boolean) => boolean)(true) : value,
  ),
  stateQueue: [] as unknown[],
  useEffect: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: mocks.useEffect,
    useRef: () => mocks.refQueue.shift() ?? { current: null },
    useState: (initialValue: unknown) => [
      mocks.stateQueue.length ? mocks.stateQueue.shift() : initialValue,
      mocks.setState,
    ],
  };
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

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

describe("MediaCardActionMenu open state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanupFns = [];
    mocks.eventHandlers = new Map();
    mocks.refQueue = [
      {
        current: {
          contains: vi.fn(() => false),
          getBoundingClientRect: () => ({
            bottom: 40,
            right: 300,
            top: 10,
          }),
        },
      },
      {
        current: {
          contains: vi.fn(() => false),
        },
      },
    ];
    mocks.stateQueue = [true, { left: 12, top: 24 }];
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      const cleanup = effect();

      if (typeof cleanup === "function") {
        mocks.cleanupFns.push(cleanup);
      }
    });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(
        (type: string, listener: EventListenerOrEventListenerObject) => {
          mocks.eventHandlers.set(type, listener);
        },
      ),
      innerHeight: 800,
      innerWidth: 1200,
      removeEventListener: vi.fn(
        (type: string, listener: EventListenerOrEventListenerObject) => {
          if (mocks.eventHandlers.get(type) === listener) {
            mocks.eventHandlers.delete(type);
          }
        },
      ),
    });
    vi.stubGlobal("Node", class Node {});
  });

  it("renders open menu items and invokes enabled action callbacks", async () => {
    const onClick = vi.fn();
    const disabledClick = vi.fn();
    const tree = (
      <MediaCardActionMenu
        label="Clip actions"
        items={[
          {
            href: "/dashboard/swapr",
            icon: <span>Icon</span>,
            label: "Use in Swapr",
          },
          {
            icon: <span>Icon</span>,
            label: "Download",
            onClick,
          },
          {
            disabled: true,
            icon: <span>Icon</span>,
            label: "Disabled",
            onClick: disabledClick,
          },
          {
            icon: <span>Icon</span>,
            label: "Delete",
            onClick: vi.fn(),
            variant: "danger",
          },
        ]}
      />
    );

    expect(renderToStaticMarkup(tree)).toContain('role="menu"');

    mocks.refQueue = [
      {
        current: {
          contains: vi.fn(() => false),
          getBoundingClientRect: () => ({
            bottom: 40,
            right: 300,
            top: 10,
          }),
        },
      },
      {
        current: {
          contains: vi.fn(() => false),
        },
      },
    ];
    mocks.stateQueue = [true, { left: 12, top: 24 }];
    const directTree = MediaCardActionMenu({
      label: "Clip actions",
      items: [
        {
          href: "/dashboard/swapr",
          icon: <span>Icon</span>,
          label: "Use in Swapr",
        },
        {
          icon: <span>Icon</span>,
          label: "Download",
          onClick,
        },
        {
          disabled: true,
          icon: <span>Icon</span>,
          label: "Disabled",
          onClick: disabledClick,
        },
      ],
    });
    const buttons = findElements(directTree, (element) => element.type === "button");
    const links = findElements(
      directTree,
      (element) => element.props?.href === "/dashboard/swapr",
    );

    (buttons[0].props.onClick as () => void)();
    (links[0].props.onClick as () => void)();
    (buttons[1].props.onClick as () => void)();
    (buttons[2].props.onClick as () => void)();

    expect(mocks.setState).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
    expect(disabledClick).not.toHaveBeenCalled();

    await Promise.resolve();
    vi.unstubAllGlobals();
  });

  it("handles viewport events, outside dismissal, and cleanup", async () => {
    const buttonContains = vi.fn(() => false);
    const menuContains = vi.fn(() => false);
    mocks.refQueue = [
      {
        current: {
          contains: buttonContains,
          getBoundingClientRect: () => ({
            bottom: 790,
            right: 100,
            top: 760,
          }),
        },
      },
      {
        current: {
          contains: menuContains,
        },
      },
    ];
    mocks.stateQueue = [true, { left: 0, top: 0 }];

    renderToStaticMarkup(
      <MediaCardActionMenu
        label="Clip actions"
        items={[
          {
            icon: <span>Icon</span>,
            label: "Download",
            onClick: vi.fn(),
          },
          {
            icon: <span>Icon</span>,
            label: "Delete",
            onClick: vi.fn(),
            variant: "danger",
          },
        ]}
      />,
    );

    await Promise.resolve();

    expect(mocks.setState).toHaveBeenCalledWith({ left: 8, top: 658 });

    const keydownHandler = mocks.eventHandlers.get("keydown") as (
      event: KeyboardEvent,
    ) => void;
    keydownHandler({ key: "Enter" } as KeyboardEvent);
    keydownHandler({ key: "Escape" } as KeyboardEvent);

    const pointerdownHandler = mocks.eventHandlers.get("pointerdown") as (
      event: PointerEvent,
    ) => void;
    pointerdownHandler({ target: {} } as unknown as PointerEvent);

    const NodeClass = globalThis.Node as unknown as new () => Node;
    const target = new NodeClass();
    buttonContains.mockReturnValueOnce(true);
    pointerdownHandler({ target } as unknown as PointerEvent);
    menuContains.mockReturnValueOnce(true);
    pointerdownHandler({ target } as unknown as PointerEvent);
    pointerdownHandler({ target } as unknown as PointerEvent);

    const resizeHandler = mocks.eventHandlers.get("resize") as () => void;
    resizeHandler();

    mocks.cleanupFns[0]();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "pointerdown",
      pointerdownHandler,
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "keydown",
      keydownHandler,
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      true,
    );

    vi.unstubAllGlobals();
  });

  it("skips listeners while closed and ignores missing button refs", () => {
    mocks.refQueue = [{ current: null }, { current: null }];
    mocks.stateQueue = [false, { left: 0, top: 0 }];

    const tree = MediaCardActionMenu({
      label: "Clip actions",
      items: [
        {
          icon: <span>Icon</span>,
          label: "Download",
          onClick: vi.fn(),
        },
      ],
    });
    const buttons = findElements(tree, (element) => element.type === "button");

    (buttons[0].props.onClick as () => void)();

    expect(window.addEventListener).not.toHaveBeenCalled();
    expect(mocks.setState).toHaveBeenCalledWith(expect.any(Function));

    vi.unstubAllGlobals();
  });
});
