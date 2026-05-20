import { beforeEach, describe, expect, it, vi } from "vitest";
import { TextOverlayTimeline } from "@/app/_components/stitchr/TextOverlayTimeline";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

const mocks = vi.hoisted(() => ({
  timelineRef: {
    current: null as null | {
      getBoundingClientRect: () => { left: number; width: number };
    },
  },
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useRef: () => mocks.timelineRef,
  };
});

function createOverlay(overrides: Partial<TextOverlay> = {}): TextOverlay {
  return {
    backgroundColor: "#000000",
    color: "#ffffff",
    endTime: 5,
    fontSize: 48,
    startTime: 1,
    styleId: "hook",
    text: "Hook",
    width: 0.8,
    x: 0.5,
    y: 0.5,
    ...overrides,
  };
}

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

describe("TextOverlayTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timelineRef.current = {
      getBoundingClientRect: () => ({
        left: 100,
        width: 200,
      }),
    };
  });

  it("renders timeline handles and updates times from keyboard events", () => {
    const onChange = vi.fn();
    const tree = TextOverlayTimeline({
      currentTime: 2,
      onChange,
      textOverlay: createOverlay(),
      totalDuration: 10,
      ugcDuration: 4,
    });
    const buttons = findElements(tree, (element) => element.type === "button");
    const [startButton, endButton] = buttons;

    (startButton.props.onKeyDown as (event: unknown) => void)({
      key: "ArrowLeft",
      preventDefault: vi.fn(),
      shiftKey: true,
    });
    (endButton.props.onKeyDown as (event: unknown) => void)({
      key: "ArrowRight",
      preventDefault: vi.fn(),
      shiftKey: false,
    });
    (endButton.props.onKeyDown as (event: unknown) => void)({
      key: "Tab",
      preventDefault: vi.fn(),
      shiftKey: false,
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: 0,
      }),
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        endTime: 5.1,
      }),
    );
  });

  it("updates handles from pointer movement and cleans up listeners", () => {
    const onChange = vi.fn();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener,
    });

    const tree = TextOverlayTimeline({
      currentTime: 12,
      onChange,
      textOverlay: createOverlay(),
      totalDuration: 10,
      ugcDuration: 12,
    });
    const [startButton] = findElements(tree, (element) => element.type === "button");

    (startButton.props.onPointerDown as (event: unknown) => void)({
      button: 0,
      clientX: 150,
      preventDefault: vi.fn(),
    });

    const pointerMove = addEventListener.mock.calls.find(
      ([eventName]) => eventName === "pointermove",
    )?.[1] as (event: { clientX: number }) => void;
    const pointerUp = addEventListener.mock.calls.find(
      ([eventName]) => eventName === "pointerup",
    )?.[1] as () => void;

    pointerMove({ clientX: 250 });
    pointerUp();

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: 2.5,
      }),
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: 4.75,
      }),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "pointermove",
      pointerMove,
    );
    expect(removeEventListener).toHaveBeenCalledWith("pointerup", pointerUp);

    vi.unstubAllGlobals();
  });

  it("ignores non-primary pointer buttons and missing timeline refs", () => {
    const onChange = vi.fn();
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const tree = TextOverlayTimeline({
      currentTime: 0,
      onChange,
      textOverlay: createOverlay(),
      totalDuration: 0,
      ugcDuration: 0,
    });
    const [startButton] = findElements(tree, (element) => element.type === "button");

    (startButton.props.onPointerDown as (event: unknown) => void)({
      button: 1,
      clientX: 150,
      preventDefault: vi.fn(),
    });
    mocks.timelineRef.current = null;
    (startButton.props.onPointerDown as (event: unknown) => void)({
      button: 0,
      clientX: 150,
      preventDefault: vi.fn(),
    });

    expect(onChange).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
