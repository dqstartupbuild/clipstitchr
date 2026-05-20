import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHorizontalSwipeNavigation } from "@/lib/clipstitchr/hooks/useHorizontalSwipeNavigation";
import { useTextOverlayDrag } from "@/lib/clipstitchr/hooks/useTextOverlayDrag";
import { useTextOverlayResize } from "@/lib/clipstitchr/hooks/useTextOverlayResize";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

const mocks = vi.hoisted(() => ({
  refValue: { current: null as unknown },
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useRef: () => mocks.refValue,
  };
});

function createOverlay(overrides: Partial<TextOverlay> = {}): TextOverlay {
  return {
    endTime: 5,
    fontSize: 0.05,
    startTime: 0,
    styleId: "clean",
    text: "Hook",
    width: 0.5,
    x: 0.2,
    y: 0.2,
    ...overrides,
  };
}

describe("text overlay pointer hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal(
      "Element",
      class Element {
        closest() {
          return null;
        }
      },
    );
  });

  it("drags overlays, snaps near center, and clears snap guides on release", () => {
    const onChange = vi.fn();
    const onSnapGuidesChange = vi.fn();
    const stageRef = {
      current: {
        getBoundingClientRect: () => ({
          height: 1000,
          width: 500,
        }),
      },
    };
    const overlayRef = {
      current: {
        getBoundingClientRect: () => ({
          height: 100,
        }),
      },
    };
    const handler = useTextOverlayDrag({
      onChange,
      onSnapGuidesChange,
      overlayRef: overlayRef as never,
      stageRef: stageRef as never,
      textOverlay: createOverlay(),
      totalDuration: 10,
    });

    handler({
      button: 0,
      clientX: 100,
      clientY: 100,
      preventDefault: vi.fn(),
    } as never);

    const pointerMove = (window.addEventListener as ReturnType<typeof vi.fn>).mock
      .calls.find(([eventName]) => eventName === "pointermove")?.[1] as (
      event: { clientX: number; clientY: number },
    ) => void;
    const pointerUp = (window.addEventListener as ReturnType<typeof vi.fn>).mock
      .calls.find(([eventName]) => eventName === "pointerup")?.[1] as () => void;

    pointerMove({ clientX: 125, clientY: 350 });
    pointerUp();

    expect(onSnapGuidesChange).toHaveBeenCalledWith({
      horizontal: true,
      vertical: true,
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        x: 0.25,
        y: 0.45,
      }),
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "pointermove",
      pointerMove,
    );
  });

  it("ignores non-primary drag/resize events and missing stages", () => {
    const onChange = vi.fn();
    const dragHandler = useTextOverlayDrag({
      onChange,
      onSnapGuidesChange: vi.fn(),
      overlayRef: { current: null } as never,
      stageRef: { current: null } as never,
      textOverlay: createOverlay(),
      totalDuration: 10,
    });
    const resizeHandler = useTextOverlayResize({
      onChange,
      stageRef: { current: null } as never,
      textOverlay: createOverlay(),
      totalDuration: 10,
    });

    dragHandler({ button: 1 } as never);
    dragHandler({ button: 0 } as never);
    resizeHandler({ button: 1 } as never);
    resizeHandler({ button: 0 } as never);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("resizes overlays and preserves full-width band width", () => {
    const onChange = vi.fn();
    const stageRef = {
      current: {
        getBoundingClientRect: () => ({
          height: 1000,
          width: 500,
        }),
      },
    };
    const handler = useTextOverlayResize({
      onChange,
      stageRef: stageRef as never,
      textOverlay: createOverlay({ styleId: "snapchat", width: 1 }),
      totalDuration: 10,
    });

    handler({
      button: 0,
      clientX: 100,
      clientY: 100,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as never);

    const pointerMove = (window.addEventListener as ReturnType<typeof vi.fn>).mock
      .calls.find(([eventName]) => eventName === "pointermove")?.[1] as (
      event: { clientX: number; clientY: number },
    ) => void;
    const pointerUp = (window.addEventListener as ReturnType<typeof vi.fn>).mock
      .calls.find(([eventName]) => eventName === "pointerup")?.[1] as () => void;

    pointerMove({ clientX: 150, clientY: 50 });
    pointerUp();

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 0.92,
      }),
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "pointermove",
      pointerMove,
    );
  });
});

describe("useHorizontalSwipeNavigation", () => {
  it("detects horizontal swipes and ignores disabled or vertical gestures", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const target = new Element();
    const handlers = useHorizontalSwipeNavigation({
      isEnabled: true,
      onSwipeLeft,
      onSwipeRight,
    });

    handlers.onTouchStart({
      target,
      touches: [{ clientX: 200, clientY: 100 }],
    } as never);
    handlers.onTouchEnd({
      changedTouches: [{ clientX: 120, clientY: 120 }],
    } as never);
    handlers.onTouchStart({
      target,
      touches: [{ clientX: 100, clientY: 100 }],
    } as never);
    handlers.onTouchEnd({
      changedTouches: [{ clientX: 180, clientY: 120 }],
    } as never);
    handlers.onTouchStart({
      target,
      touches: [{ clientX: 100, clientY: 100 }],
    } as never);
    handlers.onTouchEnd({
      changedTouches: [{ clientX: 180, clientY: 250 }],
    } as never);

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).toHaveBeenCalledTimes(1);

    const disabledHandlers = useHorizontalSwipeNavigation({
      isEnabled: false,
      onSwipeLeft,
      onSwipeRight,
    });

    disabledHandlers.onTouchStart({
      target,
      touches: [{ clientX: 200, clientY: 100 }],
    } as never);
    disabledHandlers.onTouchEnd({
      changedTouches: [{ clientX: 120, clientY: 100 }],
    } as never);

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });
});
