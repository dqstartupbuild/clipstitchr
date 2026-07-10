import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDismissOnOutsidePointer } from "@/lib/clipstitchr/hooks/useDismissOnOutsidePointer";

const mocks = vi.hoisted(() => ({
  cleanup: undefined as undefined | (() => void),
  eventHandlers: new Map<string, EventListenerOrEventListenerObject>(),
  useEffect: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
  };
});

describe("useDismissOnOutsidePointer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanup = undefined;
    mocks.eventHandlers = new Map();
    mocks.useEffect.mockImplementation((effect: () => void | (() => void)) => {
      const cleanup = effect();

      if (typeof cleanup === "function") {
        mocks.cleanup = cleanup;
      }
    });
    vi.stubGlobal("document", {
      addEventListener: vi.fn(
        (type: string, listener: EventListenerOrEventListenerObject) => {
          mocks.eventHandlers.set(type, listener);
        },
      ),
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

  it("dismisses for an outside pointer and ignores pointers inside", () => {
    const contains = vi.fn(() => true);
    const onDismiss = vi.fn();

    useDismissOnOutsidePointer({
      containerRef: { current: { contains } as unknown as HTMLElement },
      isEnabled: true,
      onDismiss,
    });

    const pointerDownHandler = mocks.eventHandlers.get("pointerdown") as (
      event: PointerEvent,
    ) => void;
    const NodeClass = globalThis.Node as unknown as new () => Node;
    const target = new NodeClass();

    pointerDownHandler({ target } as unknown as PointerEvent);
    expect(onDismiss).not.toHaveBeenCalled();

    contains.mockReturnValue(false);
    pointerDownHandler({ target } as unknown as PointerEvent);
    expect(onDismiss).toHaveBeenCalledOnce();

    pointerDownHandler({ target: {} } as unknown as PointerEvent);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("only listens while enabled and removes its listener during cleanup", () => {
    useDismissOnOutsidePointer({
      containerRef: { current: null },
      isEnabled: false,
      onDismiss: vi.fn(),
    });

    expect(document.addEventListener).not.toHaveBeenCalled();

    useDismissOnOutsidePointer({
      containerRef: { current: null },
      isEnabled: true,
      onDismiss: vi.fn(),
    });

    const pointerDownHandler = mocks.eventHandlers.get("pointerdown");
    mocks.cleanup?.();

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "pointerdown",
      pointerDownHandler,
    );
  });
});
