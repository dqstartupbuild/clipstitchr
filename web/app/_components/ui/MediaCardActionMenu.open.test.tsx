import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaCardActionMenu } from "@/app/_components/ui/MediaCardActionMenu";

const mocks = vi.hoisted(() => ({
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
      effect();
    });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      innerHeight: 800,
      innerWidth: 1200,
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("Node", class Node {});
  });

  it("renders open menu items and invokes enabled action callbacks", async () => {
    const onClick = vi.fn();
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
            onClick: vi.fn(),
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
      ],
    });
    const buttons = findElements(directTree, (element) => element.type === "button");

    (buttons[0].props.onClick as () => void)();
    (buttons[1].props.onClick as () => void)();

    expect(mocks.setState).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();

    await Promise.resolve();
    vi.unstubAllGlobals();
  });
});
